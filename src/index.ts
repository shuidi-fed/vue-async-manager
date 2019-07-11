import { VueConstructor } from 'vue'
import Suspense, { COMPONENT_NAME } from './Suspense'

export interface SSOptions {
  mode: 'visible' | 'hidden'
}

export default function install(Vue: VueConstructor, options: SSOptions) {
  Vue.component('Suspense', Suspense)

  const opts = Object.assign<SSOptions, SSOptions>(
    {
      mode: 'visible'
    },
    options
  )

  Vue.setSuspenseOptions = (options: SSOptions) => {
    Object.assign(opts, options)
  }

  Vue.mixin({
    created() {
      if (this.$options.name === COMPONENT_NAME) {
        this.$options.suspense = opts
      }
    }
  })
}

if (window && (window as any).Vue) {
  ;(window as any).Vue.use(install)
}

export { Suspense }
export { SSAsyncFactory } from './Suspense'
export { default as lazy } from './lazy'
export {
  default as createResource,
  ResourceManager,
  ResourceOptions
} from './createResource'
