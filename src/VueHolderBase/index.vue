<template>
  <div />
</template>

<script>
import Vue from 'vue'
import { LogMixin } from '../log'
import { Sync } from '../decorators'
import { Component, Watch, Mixins } from 'vue-property-decorator'
import { findHolderReg, registerHolder } from '../utils/holder'
import { registerMvm } from '../mvm'

let UNIQUE_ID = 0

const UNCOPIED_PROPS = ['name', 'uid', '__id', '__intf']

@Component({
  props: {
    name: String,
    uid: Object,
    vars: Object,
    template: String,
    createFunc: Function,
    cleanFunc: Function
  }
})
export default class VueHolderBase extends Mixins(LogMixin, Vue) {
  vhid = ''

  beforeCreate() {
    this._isVueHolder = true
  }

  created() {
    this.initReg()
    this.generateVhId(this.uid)
  }

  mounted() {
    this.setElementVhId()
  }

  @Sync @Watch('uid')
  uidChanged (uid) {
    this.generateVhId(uid)
  }

  @Sync @Watch('vhid')
  vhidChanged (vhid, old) {
    if (old) {
      this.$log('vhid', `vhid changed from '${old}' to '${vhid}'`)
      this.setElementVhId()
    }
    registerMvm(this.$parent, this.reg, vhid, this.uid)
  }

  initReg () {
    const name = this.name || `VueHolder${UNIQUE_ID++}`
    const parent = this.$parent
    let reg = findHolderReg(parent, name) || registerHolder(parent, { name })
    reg.type = this.$options.type

    Object.keys(this.$options.props)
    .filter(key => !UNCOPIED_PROPS.includes(key))
    .forEach(key => {
      if (this[key] !== undefined) {
        reg[key] = this[key]
      }
    })

    this.reg = reg
  }

  generateVhId (uid) {
    this.vhid = makeVhid(this.reg.name, uid)
  }

  setElementVhId () {
    this.$el.setAttribute('vhid', this.vhid)
  }
}

function makeVhid (name, uid) {
  let r = `${name}`
  if (uid) {
    r += '-' + Object.values(uid)
      .map(i => i && i.toString().replace(/\W/g, ''))
      .join('-')
  }
  return r
}
</script>