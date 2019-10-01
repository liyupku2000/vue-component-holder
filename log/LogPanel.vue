<template>
  <div>
    <button v-shortkey="{ win: ['ctrl', 'alt', 'l'], mac: ['ctrl', 'meta', 'l'] }" @shortkey="showModal = true" />
    <LogPanelModal v-if="showModal" @close="showModal = false" />
  </div>
</template>

<script>
import Vue from 'vue'

Vue.use(require('vue-shortkey'))

export default {
  name: 'LogPanel',

  components: {
    LogPanelModal: () => import('./LogPanelModal.vue' /* webpackChunkName: 'LogPanelModal' */)
  },

  data() {
    return {
      showModal: false
    }
  },
}
</script>

<style scoped>
button {
  display: none;
}
</style>