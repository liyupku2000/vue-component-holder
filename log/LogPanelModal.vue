<template>
  <div id="panel-mask">
    <div id="panel-wrapper">
      <div id="panel-container">

        <div id="penel-header">
          <h3>Log Categories</h3>
        </div>

        <div id="panel-body">
          <div v-for="cat in categories">
            <label>
              <input type="checkbox" v-model="cat.active" />
              <span>{{ cat.title }}</span>
            </label>
          </div>
        </div>

        <div id="panel-footer">
          <button @click="save">
            Save
          </button>
          <button @click="close" v-shortkey="['esc']" @shortkey="close">
            Cancel
          </button>
        </div>

      </div>
    </div>
  </div>
</template>

<script>
import logCategory from './logCategory'

export default {
  name: 'LogPanelModal',

  data() {
    return {
      categories: logCategory.getAllCategories().map(cat => ({
        title: cat,
        active: logCategory.isActive(cat)
      }))
    }
  },

  methods: {
    save() {
      const actives = this.categories.filter(cat => cat.active).map(cat => cat.title)
      logCategory.updateActives(actives)
      this.close()
    },

    close() {
      this.$emit('close')
    }
  }
}
</script>

<style scoped>
#panel-mask {
  position: fixed;
  z-index: 9998;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, .5);
  display: table;
  transition: opacity .3s ease;
}
#panel-wrapper {
  display: table-cell;
  vertical-align: middle;
}
#panel-container {
  width: 500px;
  margin: 0px auto;
  padding: 20px 30px;
  background-color: #fff;
  border-radius: 2px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, .33);
  transition: all .3s ease;
}
#penel-header {
  padding: 15px;
  border-bottom: 1px solid #e5e5e5;
}
#penel-header h3 {
  margin-top: 0;
}
#panel-body {
  position: relative;
  padding: 15px 25px;
}
#panel-body label {
  cursor: pointer;
}
#panel-footer {
  padding: 15px;
  text-align: right;
  border-top: 1px solid #e5e5e5;
}
#panel-footer button {
  margin-left: 20px;
  padding: 6px 12px;
  text-shadow: 0 1px 0 #fff;
  font-size: 14px;
  font-weight: 400;
  cursor: pointer;
  border: 1px solid transparent;
  border-color: #ccc;
  border-radius: 4px;
  background-color: #fff;
  background-image: linear-gradient(to bottom,#fff 0,#e0e0e0 100%);
  box-shadow: inset 0 1px 0 rgba(255,255,255,.15), 0 1px 1px rgba(0,0,0,.075);
}
</style>