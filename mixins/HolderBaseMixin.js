import pluginConfigs from '../configs'
import IntfMixin from '../intf/IntfMixin'
import UniqueIdMixin from './UniqueIdMixin'
import LogMixin from '../log/LogMixin'
import AsyncDataMixin from './AsyncDataMixin'
import { registerVueHooks, callHook, callAsyncHook, callAsyncHooks } from '../utils/hook'
import { registerHolder } from '../utils/holder'
import { printError } from '../utils/error'

registerVueHooks([ 'registerHolders', 'initMvms', 'mvmsUpdated' ])


export default {
  mixins: [IntfMixin,  UniqueIdMixin, AsyncDataMixin, LogMixin],

  beforeCreate() {
    this._holder = {
      areMvmsInited: false,
      regs: {},                   // holder registries, indexed by reg name
      mvmRegs: {},                // mvm registries, grouped by holder type and then indexed by mvm id
      mvms: {},                   // mvms, indexed by mvm id
      options: {},                // holder type options, indexed by holder type
      intfs: {}                   // mvm interfaces, indexed by reg name
    }
  },

  beforeMount() {
    if (this.$options.registerHolders) {
      callRegisterHoldersHook(this)
    }
  },

  mounted() {
    // trigger "initMvms" if this is an mvm-tree root
    if (containVueHolders(this) ) {
      if (!wrappedByVueHolder(this)) {
        callInitMvmsHook(this)
      }
    } else {
      this._holder.areMvmsInited = true
    }
  },

  methods: {
    $intf (regName, ...uid) {
      try {
        const intf = this._holder.intfs[regName].get(uid)
        if (intf.hasOwnProperty('$id')) {  // check mvm was inited correctly
          return intf
        }
      } catch(err) {
        const intfPath = [regName, ...uid]
        printError(`${this.$idPath} cannot find intf '${intfPath}'\n ${err}`)
      }
    }
  }
}

export async function callInitMvmsHook (vm) {
  await callAsyncHooks(vm, pluginConfigs.customHooks.preInitMvms)
  vm.$log('initMvms', 'before initMvms')
  await callAsyncHook(vm, 'initMvms')
  vm.$log('initMvms', 'after initMvms')
  vm._holder.areMvmsInited = true
  await callAsyncHooks(vm, pluginConfigs.customHooks.postInitMvms)
  callMvmsUpdatedHook(vm, { initializing: true })
}

export function callMvmsUpdatedHook (vm, eventArgs) {
  if (vm.$options.mvmsUpdated) {
    vm.$log('mvmsUpdated', () => `mvmsUpdated: ${JSON.stringify(eventArgs)}`);
    callHook(vm, 'mvmsUpdated', eventArgs);
  }
}

function callRegisterHoldersHook (vm) {
  const res = callHook(vm, 'registerHolders')
  if (res) {
    res.forEach(item => {
      if (Array.isArray(item)) {
        item.forEach(reg => registerHolder(vm, reg))
      } else {
        registerHolder(vm, item)
      }
    }, {})
  }
}

function containVueHolders(vm) {
  return Object.keys(vm._holder.regs).length > 0
}

function wrappedByVueHolder(vm) {
  return vm.$parent && vm.$parent._isVueHolderShadow
}