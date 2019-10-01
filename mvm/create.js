import Vue from 'vue'
import { callInitMvmsHook } from '../mixins/HolderBaseMixin'
import { findVueHolderEl } from '../utils/holder'
import { printError } from '../utils/error'
import { registerVueHooks } from '../utils/hook'

registerVueHooks([ 'asyncData', 'fetch' ])


/** reg format:
  name: string, unique name
  vars: object, defining local variables used by template
  template: string, component template
  createFunc: create func for third-party
  cleanFunc: clean func for third-party
*****/
export async function createMvm (vm, mvmReg) {
  if (mvmReg && typeof mvmReg === 'object') {
    try {
      if (mvmReg.template) {
        return await createMvmByTemplate(vm, mvmReg)
      } else if (mvmReg.createFunc) {
        return await mvmReg.createFunc.call(vm)
      }
    } catch(err) {
      printError(`When '${vm.$idPath}' is initializing mvm '${mvmReg.id}':\n ${err}`)
    }
  }
}

async function createMvmByTemplate (vm, mvmReg) {
  const { id, uid, type } = mvmReg
  const template = formalizeTemplate(mvmReg.template, vm._holder.options[type])
  const renderCode = compileTemplate(template)

  const vars = makeTemplateVars(mvmReg)
  const { ctorTag, tagExp } = parseCreatorTag(vm, template, vars, uid)
  const ctor = await makeCreator(vm, ctorTag)
  await callMvmFetch(vm, ctor.options.fetch)
  const asyncData = await callMvmAsyncData(vm, ctor.options.asyncData)

  const finalRenderCode = formalizeRenderCode(vm, renderCode, id, { ctorTag, tagExp }, vars)
  const renderFn = new Function('__ctor', '__reg', '__uid', '__asyncData', finalRenderCode)

  const shadowVm = new Vue({
    name: `Vue${type}Shadow`,
    parent: vm,
    props: { __vhid: String },
    propsData: { __vhid: id },
    render: () => renderFn.call(vm, ctor, mvmReg, uid, asyncData)
  })
  shadowVm._isVueHolderShadow = true
  shadowVm.$mount()
  vm._holder.mvms[id] = shadowVm

  const holderEl = findVueHolderEl(vm, id)
  if (!holderEl) {
    throw new Error('cannot find the corresponding VueHolder element')
  }
  holderEl.appendChild(shadowVm.$el)

  const childVm = shadowVm.$children[0]
  if (!childVm) {
    throw new Error('child component is not created correctly')
  }
  await callInitMvmsHook(childVm)

  return Object.freeze(mvmReg.intf)
}

function formalizeTemplate (template, options = {}) {
  template = template.trim()
  const tag = parseTag(template)
  const addons = options.templateAdds || ''
  template = template.replace(`<${tag}`,
    `<${tag} :__id="__reg.id" :__intf="__reg.intf" :__asyncData="__asyncData" ${addons}`)
  return template
}

function compileTemplate (template) {
  const compiled = require('vue-template-compiler').compile(template)
  if (compiled.errors.length) {
    throw new Error(compiled.errors)
  }
  return compiled.render
}

function makeTemplateVars ({ uid, vars={} }) {
  const uidVars = uid ? `var{${Object.keys(uid)}}=__uid;` : '';
  const customVars = Object.entries(vars).reduce((res, [key, value]) => {
    const isRequired = key.startsWith('*')
    if (isRequired) {
      key = key.substring(1);
    }
    res += `var ${key}=${value};`
    if (isRequired) {
      res += `if(${key}===undefined)return;`
    }
    return res
  }, '')
  return uidVars + customVars
}

function parseCreatorTag (vm, template, vars, uid) {
  let tag = parseTag(template)
  if (!tag) {
    throw Error(`Cannot find tag in holder template ${template}`)
  }

  if (tag === 'component' || tag === 'Component') {  // dynamic tag
    const match$1 = template.match(/:is="(.+?)"/)
    if (match$1) {
      const tagExp = match$1[1]
      const fn = new Function('__uid', `with(this){${vars}return ${tagExp}}`)
      return {
        ctorTag: fn.call(vm, uid),
        tagExp
      }
    } else {
      const match$2 = template.match(/is="(.+?)"/)
      if (match$2) {
        tag = match$2[1]
      }
    }
  }

  return { ctorTag: tag }
}

function parseTag (template) {
  const match = template.match(/^<([^\s|^>]+)/)
  return match && match[1]
}

async function makeCreator (vm, ctorTag) {
  const def = vm.$options.components[ctorTag]
  if (typeof def === 'function') {
    if (def.options && def.component) { // vue component
      return Vue.extend(def);
    } else {                            // import function
      const module = await def();
      return Vue.extend(module['default']);
    }
  } else if (typeof def === 'object') { // vue options
    return Vue.extend(def);
  } else {                              // global component
    return Vue.options.components[ctorTag];
  }
}

function formalizeRenderCode (vm, renderCode, id, { ctorTag, tagExp }, vars) {
  if (!tagExp) {
    const regex = new RegExp(`_c\\(('${ctorTag}'|"${ctorTag}"),`)
    renderCode = renderCode.replace(regex, '_c(__ctor,')
  } else {
    renderCode = renderCode.replace(`_c(${tagExp},`, '_c(__ctor,')
  }

  renderCode = renderCode.replace('with(this){', `with(this){${vars}`)
  logRenderCode(vm, 'render fn', id, renderCode)
  renderCode = transpileRenderCode(renderCode)
    .replace(/_vm.__ctor/g, '__ctor')
    .replace(/_vm.__reg/g, '__reg')
    .replace(/_vm.__uid/g, '__uid')
    .replace(/_vm.__asyncData/g, '__asyncData')
  logRenderCode(vm, 'transpiled render fn', id, renderCode)
  return renderCode
}

function transpileRenderCode (code) {
  code = `(function(){${code}})()`
  code = require('vue-template-es2015-compiler')(code)
  return code.substring(12, code.length - 4);
}

function logRenderCode (vm, logCategory, id, renderCode) {
  if (process.env.NODE_ENV === 'development') {
    const prettier = require('prettier/standalone')
    const parserBabylon = require('prettier/parser-babylon')
    renderCode = prettier.format(renderCode, {
      parser: 'babel',
      plugins: [parserBabylon]
    });
  }
  vm.$log(logCategory, `${id}:\n${renderCode}`)
}

async function callMvmFetch(vm, fetchFns) {
  if (fetchFns) {
    await Promise.all(
      fetchFns.map( f => f(vm) )
    )
  }
}

async function callMvmAsyncData(vm, asyncDataFns) {
  if (asyncDataFns) {
    const dataList = await Promise.all(
      asyncDataFns.map( f => f(vm) )
    )
    return dataList.reduce(
      (res, data) => Object.assign(res, data)
    , {})
  }
}