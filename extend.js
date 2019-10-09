import Vue from 'vue'
import VueHolderBase from './VueHolderBase'
import changeCase from 'change-case'

const VueHolderTags = []

// type is a Pasca-Case string
function registerVueHolderExtension (type, moreProps) {
  const name = `Vue${type}`
  const kebabName = changeCase.kebabCase(name)

  Vue.component(kebabName, {
    extends: VueHolderBase,
    name,
    type,
    props: moreProps
  })

  VueHolderTags.push(name, kebabName)
}

export {
  registerVueHolderExtension as default,
  VueHolderTags
}