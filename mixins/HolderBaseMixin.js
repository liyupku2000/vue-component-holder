import { installOptions } from '../install'
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
    // trigger "initMvms" if this is the root of a vue-holder tree
    if ( containVueHolders(this) && !wrappedByVueHolder(this) ) {
      callInitMvmsHook(this)
    }
  },

  beforeDestroy() {
    if (this._isVueHolderMvm) {
      this.$log('destroy')
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
  vm._isVueHolderMvm = true

  await callAsyncHooks(vm, installOptions.customHooks.preInitMvms)
  vm.$log('initMvms', 'before initMvms')
  await callAsyncHook(vm, 'initMvms')
  vm.$log('initMvms', 'after initMvms')
  await callAsyncHooks(vm, installOptions.customHooks.postInitMvms)

  callMvmsUpdatedHook(vm, { initializing: true })
  vm._holder.areMvmsInited = true
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