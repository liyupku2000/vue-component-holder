import Vue from 'vue'
import { Component } from 'vue-property-decorator'


@Component({
  props: {
    __asyncData: Object
  }
})
export default class AsyncDataMixin extends Vue {
  data() {
    return this.__asyncData
  }
}
