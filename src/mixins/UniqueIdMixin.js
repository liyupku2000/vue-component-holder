import { Public } from '../intf/IntfMixin'
import { Component } from 'vue-property-decorator'
import Vue from 'vue'

let UNIQUE_ID = 0

@Component({
  props: {
    __id: {
      type: String,
      default() {
        const name = this ? this.$options.name : 'component'
        return `${name}${UNIQUE_ID++}`
      }
    }
  }
})
export default class UniqueIdMixin extends Vue {
  @Public
  get $id () {
    return this.__id
  }

  get $idPath () {
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