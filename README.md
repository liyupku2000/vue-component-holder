# vue-component-holder

[![Version](https://img.shields.io/npm/v/vue-component-holder.svg)](https://www.npmjs.com/package/vue-component-holder)

# Navigation

- [Introduction](#Introduction)
- [Installation](#Installation)
- [Holdify](#Holdify)
- [Installation Options](#Installation-Options)
- [APIs and Hooks](#APIs-and-Hooks)

# Introduction

This plugin introduces a component placeholder machanism. It places a placeholder component at the original place of each child component and manages the creation/mounting/destroy of child components by the plugin itself. Each of these child components then becomes an "mvm" (managed vm). If vue adds/deletes/updates the placeholder components, the plugin applies the same changes to the mvms. Since the mvms are totally managed by the plugin, it is possible to inject some (asynchronized) custom hooks before and after their creation/mounting, which makes it handy to deal with asynchronous data. For example, this plugin injects an "asyncData" hook on mvms ([Nuxt](https://nuxtjs.org/api/) could only inject similar hooks on page components).

To tag a child component as an mvm, just wrap it with a "vue-holder" component as follows:

```html
<!-- MyParentComponent.vue -->
<template>
<div>
  <vue-holder name="MyFavoriteName">
    <MyChildComponent />
  </vue-holder>
</template>
```

To prevent vue from creating the child components before we change them to mvms, we need to edit the template AST generated by [vue-component-compiler](https://github.com/vuejs/vue-component-compiler). This is done by the "holdify" function we inject into "vue-loader" (details in [Installation](#Installation)). The child's template will be moved from the default slot to the template attribute of the placeholder component. Some other attributes will be added also if necessary (details in [Holdify](#Holdify)).

```html
<vue-holder name="MyFavoriteName" template="<MyChildComponent />">
</vue-holder>
```

Then, the plugin could make the mvm's render function based on the placeholder component's attributes. It would wait for the code chunk before running the render function if the child component is composed asynchronously. It could also run some asynchronized hooks to fetch data or update stores as follows:

```js
/** MyChildComponent.vue */
<template>
<div>
  <div>Name: {{ name }}</div>
  <div>Recommendations: {{ $store.state.recommendations }} </div>
</div>
</template>
<script>
export default {
  async fetch({ $store, $route }) {
    const { data } = await axios.get(`/api/my-recommendations/${$route.params.id}`)
    $store.commit('updateRecommandations', data)
  }

  async asyncData({ $route }) {
    const { data } = await axios.get(`/api/my-data/${$route.params.id}`)
    return { name: data.name }
  }
}
</script>
```

# Installation

**npm**

```bash
npm install liyupku2000/vue-component-holder --save
```

**yarn**

```bash
yarn add liyupku2000/vue-component-holder
```

Add the following at webpack.config.js -> module.exports -> modules -> rules -> (vue) -> use -> options:

```js
compilerModules: [{
  postTransformNode: require('vue-compoent-holder/holdify')()
}]
```

Or the following in vue.config.js:

```js
module.exports = {
  chainWebpack: config => {
    config.module
      .rule('vue')
      .use('vue-loader')
        .loader('vue-loader')
        .tap(options => {
            options.compilerModules = options.compilerModules || [];
            options.compilerModules.push({
              postTransformNode: require('vue-component-holder/holdify')()
            })
            return options
        })
  }
}
```

Install the plugin (details in [Installation Options](#Installation-Options)):

```js
import Vue from 'vue'
import VueComponentHolder from 'vue-compoent-holder'

Vue.use(VueComponentHolder, {
  // plugin options
})
```

After installation, you can simply wrap your component in the template as follows:

```html
<vue-holder name="YourFavoriteName">
  <MyChildComponent />
</vue-holder>
```

Please refer the [demo project](https://github.com/liyupku2000/vue-component-holder-demo) for more usage examples.

# Holdify

If the child component is in "v-for" loop(s), it could have multiple mvm instances. In this case, the holdify function will add more attributes on the placeholder component. For example, the "uid" attribute is added to identify different mvms, and the "vars" attribute is added to pass local variables to the mvm's render function. Please view our holdify examples or try it yourself on [Holdify Demo](https://github.com/liyupku2000/holdify-demo).

# Installation Options

**globalHolderMixin**

This option is default to "true". If it is "false", you need to setup "HolderMixin" manually as follows:

```js
/** MyParentComponent.vue */
import { HolderMixin } from 'vue-compoent-holder'
export default {
  mixins: [ HolderMixin /* more mixins*/ ]
}
```

```js
/** MyChildComponent.vue */
import { HolderMixin } from 'vue-compoent-holder'
export default {
  mixins: [ HolderMixin /* more mixins*/ ]
}
```

**customHooks**

You could inject asynchronized custom hooks in the parent component. They are partitioned into two groups: "preInitMvms" and "postInitMvms", indicating they are excuted before or after the mvms are initialized.

```js
/** MyParentComponent.vue */
Vue.use(VueComponentHolder, {
  customHooks: {
    preInitMvms: [ 'beforeInit' ],
    postInitMvms: [ 'inited' ]
  }
})

export default {
  async beforeInit() {
  },

  async inited() {
  }
}
```

# APIs and Hooks

Please refer the [demo project](https://github.com/liyupku2000/vue-component-holder-demo) for their usage examples.

**$intf**

This function could retrieve the interface object of a specific mvm with the holder name and uid.

**$publish (or @Public)**

The "$publish" function is used to publish the properties of a mvm within its interface object.
With [vue-class-component](https://github.com/vuejs/vue-class-component), you could publish a property of a mvm with the "@Public" decorator.

**mvmsUpdated**

A hook, defined in the parent component, is called every time some mvm(s) are created/deleted/updated.

**asyncData**

A hook, defined in the child component, is called before an mvm is created, which helps to fetch async data.

**fetch**

A hook, defined in the child component, is called before an mvm is created, which helps to update stores.