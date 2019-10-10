<template>
  <div />
</template>

<script>
import { LogMixin } from '../log'
import { findHolderReg, registerHolder } from '../utils/holder'
import { registerMvm } from '../mvm'

let UNIQUE_ID = 0

export default {
  name: 'VueHolderBase',

  mixins: [LogMixin],

  props: {
    name: String,
    uid: Object,
    vars: Object,
    template: String,
    createFunc: Function,
    cleanFunc: Function
  },

  beforeCreate() {
    this._isVueHolder = true
  },

  created() {
    this.initReg()
    this.generateVhId(this.uid)
  },

  mounted() {
    this.setElementVhId()
  },

  data() {
    return {
      vhid: ''
    }
  },

  watch: {
    uid: {
      sync: true,
      handler(uid) {
        this.generateVhId(uid)
      }
    },

    vhid: {
      sync: true,
      handler(vhid, old) {
        if (old) {
          this.$log('vhid', `vhid changed from '${old}' to '${vhid}'`)
          this.setElementVhId()
        }
        registerMvm(this.$parent, this.reg, vhid, this.uid)
      }
    }
  },

  methods: {
    initReg () {
      const name = this.name || `VueHolder${UNIQUE_ID++}`
      const parent = this.$parent
      let reg = findHolderReg(parent, name) || registerHolder(parent, { name })
      reg.type = this.$options.type

      const skippedProps = ['name', 'uid', '__id', '__intf']
      Object.keys(this.$options.props)
      .filter(key => !skippedProps.includes(key))
      .forEach(key => {
        if (this[key] !== undefined) {
          reg[key] = this[key]
        }
      })

      this.reg = reg
    },

    generateVhId (uid) {
      this.vhid = makeVhid(this.reg.name, uid)
    },

    setElementVhId () {
      this.$el.setAttribute('vhid', this.vhid)
    }
  }
}

function makeVhid (name, uid) {
  let r = `${name}`
  if (uid) {
    r += '[' + Object.values(uid).join('][') +']'
  }
  return r
}
</script>