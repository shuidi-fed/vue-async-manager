import { Component, VNode } from 'vue'
import { del, add, has, SSAsyncFactory, SSVue, SSComponent } from './Suspense'
import { currentSuspenseInstance } from './currentInstance'
import { PropsDefinition, DefaultProps } from 'vue/types/options'

export default function lazy<PropsDef = PropsDefinition<DefaultProps>>(
  asyncFactory: SSAsyncFactory,
  props?: PropsDef
): Component {
  return {
    name: 'SSLazy',
    props: props || [],
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

      // Fix context
      const slots = Object.keys(this.$slots)
        .reduce(
          (arr, key) => (arr as VNode[]).concat(this.$slots[key] || []),
          []
        )
        .map(vnode => {
          vnode.context = this._self
          return vnode
        })

      return asyncFactory.resolved
        ? h(
            asyncFactory.resolved as Component,
            {
              on: this.$listeners,
              // If there is no props definition, fall back to `this.$attrs`
              props: props ? this.$props : this.$attrs,
              // Passthrough scopedSlots
              scopedSlots: this.$scopedSlots,
              attrs: this.$attrs
            },
            slots
          )
        : this._e()
    }
  }
}
