import HolderMixin, { HOLDER_TYPE } from './mixins/HolderMixin'
import registerVueHolderExtension from './extend'
import pluginConfigs from './configs'

function installVueHolder (Vue) {
  if (pluginConfigs.globalHolderMixin) {
    Vue.mixin(HolderMixin)
  }

  registerVueHolderExtension(HOLDER_TYPE)
}

export default installVueHolder