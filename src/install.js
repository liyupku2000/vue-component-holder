import { registerVueHooks } from './utils/hook'
import HolderMixin, { HOLDER_TYPE } from './mixins/HolderMixin'
import registerVueHolderExtension from './extend'

const installOptions = {}

function normalizeOptions (options) {
  options.globalHolderMixin = options.globalHolderMixin !== false
  options.customHooks = options.customHooks || {}
  return options
}

function installVueHolder (Vue, options = {}) {
  Object.assign(installOptions, normalizeOptions(options))

  registerVueHooks(installOptions.customHooks.preInitMvms)
  registerVueHooks(installOptions.customHooks.postInitMvms)

  if (installOptions.globalHolderMixin) {
    Vue.mixin(HolderMixin)
  }

  registerVueHolderExtension(HOLDER_TYPE)
}


export {
  installVueHolder as default,
  installOptions
}