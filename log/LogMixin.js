import { Component } from 'vue-property-decorator'
import logCategory from './logCategory'
import Vue from 'vue'

@Component
export default class LogMixin extends Vue {
  $log (category, msg) {
    if (process.env.NODE_ENV === 'development') {
      logCategory.register(category);
      if (logCategory.isActive(category)) {
        msg = msg || category
        if (typeof msg === 'function') {
          msg = msg()
        }
        console.log(`[${this.$idPath}] ${msg}`)
      }
    }
  }
}