import Vue from 'vue'
import VueHolderBase from './VueHolderBase'
import changeCase from 'change-case'

// type is a Pasca-Case string
export default function registerVueHolderExtension (type, moreProps) {
  const name = `Vue${type}`
  Vue.component(changeCase.kebabCase(name), {
    extends: VueHolderBase,
    name,
    type,
    props: moreProps
  })
}