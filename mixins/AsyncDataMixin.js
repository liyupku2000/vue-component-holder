export default {
  props: {
    __asyncData: Object
  },

  data() {
    return this.__asyncData || {}
  }
}
