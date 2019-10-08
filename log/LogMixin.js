import logCategory from './logCategory'

export default {
  methods: {
    $log (category, msg, attachedId) {
      if (process.env.NODE_ENV === 'development') {
        logCategory.register(category);
        if (logCategory.isActive(category)) {
          msg = msg || category
          if (typeof msg === 'function') {
            msg = msg()
          }

          let idPath = this.$idPath
          if (attachedId) {
            idPath += '__' + attachedId
          }
          console.log(`[${idPath}] ${msg}`)
        }
      }
    }
  }
}