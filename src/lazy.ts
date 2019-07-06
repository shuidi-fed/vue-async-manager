import { Component } from 'vue'
import { del, add, has, SSAsyncFactory, SSVue, SSComponent } from './Suspense'
import { currentSuspenseInstance } from './currentInstance'

export default function lazy(asyncFactory: SSAsyncFactory): Component {
  return {
    name: 'SSLazy',
    created() {
      if (has(asyncFactory)) return

      add(asyncFactory)

      if (asyncFactory.resolved) {
        ;(asyncFactory.$$waiter as Promise<SSComponent>).then(() => {
          del(asyncFactory)
        })
        return
      }
      const promise = asyncFactory()
      asyncFactory.suspenseInstance = currentSuspenseInstance as SSVue
      asyncFactory.$$waiter = promise

      promise.then(C => {
        // Compatible ES Module
        if (C.__esModule && C.default) {
          C = C.default
        }
        asyncFactory.resolved = C
        // Trigger update
        this.$forceUpdate()
      })
    },
    updated() {
      del(asyncFactory)
    },
    render(this: SSVue, h) {
      console.log('SSLazy render')
      return asyncFactory.resolved
        ? h(asyncFactory.resolved as Component)
        : this._e()
    }
  }
}
