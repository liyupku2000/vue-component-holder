# vue-component-holder

[![Version](https://img.shields.io/npm/v/vue-component-holder.svg)](https://www.npmjs.com/package/vue-component-holder)

# Navigation

- [Introduction](#Introduction)
- [Installation](#Installation)
- [Holdify](#Holdify)
- [Configuration](#Configuration)
- [APIs and Hooks](#APIs-and-Hooks)


# Introduction

This plugin introduces a component placeholder machanism. A placeholder component replaces the original child component in the template, and the plugin creates/mounts/destroys the child component by itself. This child component then becomes an "mvm" (managed vm). If vue updates the placeholder, the plugin applies the same changes to the mvm. Since the mvm is totally managed by the plugin, it is possible to inject some (asynchronized) custom hooks before and after the creation. For example, an "asyncData" hook is injected into mvms to prefetch asynchronous data ([Nuxt](https://nuxtjs.org/api/) is only able to do it on page components).

To declare an mvm, just wrap a child component with "vue-holder" as follows:

```html
<!-- MyParentComponent.vue -->
<template>
<div>
  <vue-holder name="MyFavoriteName">
    <MyChildComponent />
  </vue-holder>
</template>
```

To prevent vue from managing mvms, we need to edit the template AST generated by [vue-component-compiler](https://github.com/vuejs/vue-component-compiler). This is done by the "holdify" function we inject into "vue-loader" (details in [Installation](#Installation)). In the previous example, the child's template is moved from the default slot to the template attribute as follows:

```html
<vue-holder name="MyFavoriteName" template="<MyChildComponent />">
</vue-holder>
```

Then, the plugin could make a render function for this mvm based on the results of "holdify". Before running the render function, it is possible to run some injected hooks declared as follows:

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
  },

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
npm install vue-component-holder --save
```

**yarn**

```bash
yarn add vue-component-holder
```

Add the following at webpack.config.js -> module.exports -> modules -> rules -> (vue) -> use -> options:

```js
/** webpack.config.js */
        compilerModules: [{
          postTransformNode: require('vue-component-holder/holdify')()
        }]
```

Or the following in vue.config.js:

```js
/** vue.config.js */
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

Install the plugin in the early stage of your project:

```js
import Vue from 'vue'
import VueComponentHolder from 'vue-component-holder'

Vue.use(VueComponentHolder)
```

After installation, you could simply wrap your component in the template:

```html
<vue-holder name="YourFavoriteName">
  <MyChildComponent />
</vue-holder>
```

Please refer the [demo project](https://github.com/liyupku2000/vue-component-holder-demo) for more usage examples.


# Holdify

**HTML Template**

If the child component is in "v-for" loop(s), it could have multiple mvm instances. In this case, the "holdify" function will add more attributes on the placeholder component. For example, the "uid" attribute is added to identify different mvms, and the "vars" attribute is added to pass local variables to the mvm's render function. Please view our "holdify" examples or try it yourself on [Holdify Demo](https://liyupku2000.github.io/holdify-demo/).

**JSX**

Automatic "holdify" in JSX has not been implemented yet. To use "vue-holder" with JSX, you have to do "holdify" manually by providing the neccessary attributes.


# Configuration

A "holder.config.js" file is used to configure the plugin. Place it at the same level with the "node_modules" folder where the plugin was installed.
Normally, it should be placed in the project root folder.

```js
/** holder.config.js */
module.exports = {
  // plugin configs as below
}
```

**globalHolderMixin**

This option is default to "true". If it is "false", you need to setup "HolderMixin" manually as follows:

```js
/** holder.config.js */
module.exports = {
  globalHolderMixin: false
}
```

```js
/** MyParentComponent.vue */
import { HolderMixin } from 'vue-component-holder'
export default {
  mixins: [ HolderMixin /* more mixins*/ ]
}
```

```js
/** MyChildComponent.vue */
import { HolderMixin } from 'vue-component-holder'
export default {
  mixins: [ HolderMixin /* more mixins*/ ]
}
```

**customHooks**

You could inject asynchronized custom hooks in the parent component. They are partitioned into two groups: "preInitMvms" and "postInitMvms", indicating if they are excuted before or after the mvms are initialized.

```js
/** holder.config.js */
module.exports = {
  customHooks: {
    preInitMvms: [ 'beforeInit' ],
    postInitMvms: [ 'inited' ]
  }
}
```

```js
/** MyParentComponent.vue */
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

This function retrieves the interface object of a specific mvm with the holder name and uid.

**$publish (or @Public)**

With the "$publish" function, an mvm reveals some functions via its interface object. If working with [vue-class-component](https://github.com/vuejs/vue-class-component), it could also use the "@Public" decorator.

**mvmsUpdated**

A hook, defined in the parent component, is called everytime there are some mvms created/deleted/updated.

**asyncData**

A hook, defined in the child component, is called before an mvm is created, which helps to fetch async data.

**fetch**

A hook, defined in the child component, is called before an mvm is created, which helps to update stores.