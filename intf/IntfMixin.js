import { Component } from 'vue-property-decorator'
import { createDecorator } from 'vue-class-component'
import Vue from 'vue'

export const Public = createDecorator((options, key) => {
  options._publicKeys = options._publicKeys || []
  options._publicKeys.push(key)
})

Vue.config.optionMergeStrategies._publicKeys = function(toVal = [], fromVal = []) {
  return [...new Set(toVal.concat(fromVal))]
}

@Component({
  props: {
    __intf: Object
  }
})
export default class IntfMixin extends Vue {
  created() {
    this.$publish(this.$options._publicKeys)
  }

  $publish(keys) {
    const intf = this.__intf
    if (intf && keys) {
      if (typeof keys === 'string') {
        keys = keys.split(/[\s|,]+/g)
      }

      if (Array.isArray(keys)) {
        keys.forEach(key => {
          let prop = this[key]
          if (typeof prop === 'function' && !prop.name.startsWith('bound ')) {
            prop = prop.bind(this)
          }
          intf[key] = prop
        })
      }
    }
  }

  $setProxyIntf(proxyIntf) {
    if (this.__intf) {
      Object.assign(this.__intf, proxyIntf)
    }
  }
}