let UNIQUE_ID = 0

export default {
  name: 'UniqueIdMixin',

  props: {
    __id: {
      type: String,
      default() {
        const name = /*this && this.$options ? this.$options.name :*/ 'component'
        return `${name}${UNIQUE_ID++}`
      }
    }
  },

  created() {
    this.$publish('$id')
  },

  computed: {
    $id() {
      return this.__id
    },

    $idPath () {
      const idList = []
      let vm = this
      while(vm) {
        if ((!vm._isVueHolderShadow || vm === this)
            && (vm.__id || vm.$options.name)
        ) {
          idList.push(vm.__id || `${vm.$options.name}`)
        }
        vm = vm.$parent
      }
      return idList.reverse().join('__')
    }
  }
}