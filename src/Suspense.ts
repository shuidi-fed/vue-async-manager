import Vue, { CreateElement, Component, VNode, VNodeChildren } from 'vue'
import {
  pushSuspenseInstance,
  popSuspenseInstance,
  currentSuspenseInstance
} from './currentInstance'
import { SSOptions } from './index'

export type SSComponent = Component & { __esModule?: any; default?: Component }

export interface SSAsyncFactory<I = any, R = any> {
  (input?: I): Promise<R>
  suspenseInstance?: Vue
  resolved?: Component | boolean
  $$waiter?: Promise<R>
  res?: any
}

export const RESOLVED = 'resolved'
export const REJECTED = 'rejected'
export const del = (af: SSAsyncFactory, error?: any) => {
  const suspIns = af.suspenseInstance
  if (!suspIns) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('No Suspense instance')
    }
    return
  }
  const asyncFactorys = suspIns.asyncFactorys

  if (error) {
    suspIns.$emit(REJECTED, error)
    return
  }

  asyncFactorys.delete(af)
  if (asyncFactorys.size === 0) {
    suspIns.$emit(RESOLVED)
  }
}
export const add = (af: SSAsyncFactory) => {
  const suspIns = currentSuspenseInstance || af.suspenseInstance
  if (!suspIns) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('No Suspense instance')
    }
    return
  }
  const asyncFactorys =
    suspIns.asyncFactorys || (suspIns.asyncFactorys = new Set())

  if (suspIns.resolved) {
    suspIns.resolved = false
    suspIns.setupLoading()
  }
  asyncFactorys.add(af)
}
export const has = (af: SSAsyncFactory) => {
  const suspIns = currentSuspenseInstance || af.suspenseInstance
  if (!suspIns) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('No Suspense instance')
    }
    return
  }
  return suspIns.asyncFactorys && suspIns.asyncFactorys.has(af)
}

export const COMPONENT_NAME = 'VueSuspense'
export default {
  name: COMPONENT_NAME,
  data() {
    return {
      resolved: false,
      displayLoading: false
    }
  },
  props: {
    delay: {
      type: Number,
      default: 0
    }
  },
  methods: {
    setupLoading() {
      // Setting loading status
      if (this.delay > 0) {
        this._timer = setTimeout(() => {
          this.displayLoading = true
        }, this.delay)
      } else {
        this.displayLoading = true
      }
    },
    destroyLoading() {
      if (this._timer) {
        clearTimeout(this._timer)
        this._timer = null
      }
      this.displayLoading = false
    }
  },
  created() {
    pushSuspenseInstance(this)
    // `this.promiser` is for test cases
    this.promiser = new Promise((resolve, reject) => {
      this.$on(RESOLVED, () => {
        this.destroyLoading()
        this.resolved = true
        resolve()
      })

      this.$on(REJECTED, (err: Error) => {
        this.destroyLoading()
        this.rejected = true
        reject(err)
      })
    })

    this.setupLoading()
  },
  mounted() {
    if (!this.asyncFactorys) {
      // This means that there are no lazy components or resource.read()
      // in the child components of the Suspense component,
      // set to resolved to update rendering.
      // Warning: If the content wrapped by the Suspense component is static, the static content will be rendered twice.
      this.$emit(RESOLVED)
    }
  },
  updated() {
    /**
     * If the asynchronous call has not been resolved,
     * the reason for triggering the update is to do something else,
     * such as: display loading, etc., so popSuspenseInstance() should not be called.
     */
    if (!this.resolved) return
    popSuspenseInstance()
  },
  render(this: Vue, h: CreateElement) {
    const isVisible =
      ((this.$options as any).suspense as SSOptions).mode === 'visible'
    const emptyVNode = this._e()
    const fallback = this.displayLoading
      ? this.$slots.fallback || [emptyVNode]
      : [emptyVNode]
    // The `tree` is the real content to be rendered
    const tree = this.$slots.default || [emptyVNode]

    let rendered
    if (this.rejected && this.$slots.error) {
      rendered = createWrapper(h, this.$slots.error)
    } else {
      rendered = this.resolved
        ? isVisible
          ? createWrapper(h, tree)
          : createWrapper(h, [
              // We need to render the tree, but we should not show the rendered content.
              h(
                'div',
                {
                  style: { display: 'block' },
                  class: { 'vue-suspense-hidden-wrapper': true }
                },
                tree
              )
            ])
        : isVisible
        ? createWrapper(h, tree.concat(fallback))
        : createWrapper(h, [
            // We need to render the tree, but we should not show the rendered content.
            h(
              'div',
              {
                style: { display: 'none' },
                class: { 'vue-suspense-hidden-wrapper': true }
              },
              tree
            ),
            fallback
          ])
    }

    return rendered
  }
}

function createWrapper(h: CreateElement, children: VNodeChildren): VNode {
  return h(
    'div',
    {
      class: { 'vue-suspense-wrapper': true }
    },
    children
  )
}
