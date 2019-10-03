import { registerVueHooks } from './utils/hook'

const pluginConfigs = (function() {
  const configs = loadConfigs()
  return normalizeConfigs(configs)
})()

registerVueHooks(pluginConfigs.customHooks.preInitMvms)
registerVueHooks(pluginConfigs.customHooks.postInitMvms)


function loadConfigs() {
  try {
    return require('../../holder.config.js')
  } catch(err) {
    return {}
  }
}

function normalizeConfigs (configs) {
  return Object.assign({
    globalHolderMixin: true,
    customHooks: {}
  }, configs)
}

export default pluginConfigs