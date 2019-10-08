import Component from 'vue-class-component'
import Vue from 'vue'

function registerVueHook(name, strat) {
  Component.registerHooks([ name ])
  const strats = Vue.config.optionMergeStrategies
  strats[name] = (typeof strat === 'function') ? strat
    : (typeof strat === 'string') ? starts[strat]
    : strats.created
}

function registerVueHooks(names, strat) {
  if (Array.isArray(names)) {
    names.forEach(registerVueHook, strat)
  }
}

function callHook (vm, name, ...args) {
  if (!vm._isDestroyed) {
    const hooks = vm.$options[name]
    vm.$log('all hooks', `call ${name}()`);
    if (hooks) {
      vm.$log('declared hooks', `call ${name}()`);
      return hooks.map( hook => hook.apply(vm, args) )
    }
  }
}

async function callAsyncHook (vm, name, ...args) {
  if (!vm._isDestroyed) {
    const hooks = vm.$options[name]
    vm.$log('all hooks', `await ${name}()`);
    if (hooks) {
      vm.$log('declared hooks', `await ${name}()`);
      return Promise.all(
        hooks.map( hook => hook.apply(vm, args) )
      )
    }
  }
}

async function callAsyncHooks (vm, names, ...args) {
  if (Array.isArray(names)) {
    for(let i=0; i<names.length; i++) {
      await callAsyncHook(vm, names[i], ...args)
    }
  }
}

export {
  registerVueHook,
  registerVueHooks,
  callHook,
  callAsyncHook,
  callAsyncHooks
}