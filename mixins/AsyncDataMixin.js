export default {
  name: 'AsyncDataMixin',

  props: {
    __asyncData: Object
  },

  data() {
    return this.__asyncData || {}
  }
}
