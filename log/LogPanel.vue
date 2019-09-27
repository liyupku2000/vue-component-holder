<template>
  <div>
    <button v-shortkey="{ win: ['ctrl', 'alt', 'l'], mac: ['ctrl', 'meta', 'l'] }" @shortkey="showModal = true" />
    <LogPanelModal v-if="showModal" @close="showModal = false" />
  </div>
</template>

<script>
import { Component } from 'vue-property-decorator'
import Vue from 'vue'

Vue.use(require('vue-shortkey'))

@Component({
  components: {
    LogPanelModal: () => import('./LogPanelModal.vue' /* webpackChunkName: 'LogPanelModal' */)
  }
})
export default class LogPanel extends Vue {
  showModal = false
}
</script>

<style scoped>
button {
  display: none;
}
</style>