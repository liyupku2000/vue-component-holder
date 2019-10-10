import { callInitMvmsHook } from './HolderBaseMixin'
import HolderMixin from './HolderMixin'

export default {
  extends: HolderMixin,

  beforeCreate() {
    this._isMvmTreeRoot = true
  },

  mounted() {
    callInitMvmsHook(this)
  }
}