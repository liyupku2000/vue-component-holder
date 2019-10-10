import { callInitMvmsHook } from './HolderBaseMixin'
import HolderMixin from './HolderMixin'

export default {
  extends: HolderMixin,

  mounted() {
    callInitMvmsHook(this)
  }
}