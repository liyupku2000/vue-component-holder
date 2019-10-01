import logCategory from './logCategory'

export default {
  name: 'LogMixin',

  methods: {
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
}