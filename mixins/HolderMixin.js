import HolderBaseMixin, { callMvmsUpdatedHook } from './HolderBaseMixin'
import { udpateMvms, cleanMvms } from '../mvm'
import { Component } from 'vue-property-decorator'

export const HOLDER_TYPE = 'Holder'

@Component
export default class HolderMixin extends HolderBaseMixin {
  async initMvms() {
    await udpateMvms(this, HOLDER_TYPE)
  }

  async updated() {
    if (this._holder.mvmRegs[HOLDER_TYPE]) {
      const updatedHolders = await udpateMvms(this, HOLDER_TYPE)
      if (updatedHolders.length) {
        callMvmsUpdatedHook(this, { updatedHolders })
      }
    }
  }

  beforeDestroy() {
    cleanMvms(this, HOLDER_TYPE)
  }
}