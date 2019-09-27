import { createDecorator } from 'vue-class-component'

export const NoCache = createDecorator((options, key) => {
  options.computed[key].cache = false
})

export const Sync = createDecorator((options, key) => {
  if (key.endsWith('Changed')) {
    key = key.substring(0, key.length - 7)
    options.watch[key][0].sync = true
  } else {
    options.computed[key].sync = true
  }
})