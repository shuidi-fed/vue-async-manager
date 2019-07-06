import Vue, { CreateElement, Component, VNode, VNodeChildren } from 'vue'
import {
  pushSuspenseInstance,
  popSuspenseInstance,
  currentSuspenseInstance
} from './currentInstance'
import { SSOptions } from './index'

export type SSComponent = Component & { __esModule?: any; default?: Component }

export interface SSAsyncFactory {
  (): Promise<SSComponent>
  suspenseInstance?: SSVue
  resolved?: Component
  $$waiter?: Promise<SSComponent>
}

export interface SSFetchFactory {
  (...args: any[]): Promise<any>
  suspenseInstance?: SSVue
  resolved?: boolean
  res?: any
}

export interface SSVue extends Vue {
  asyncFactorys: Set<SSFactory>
  resolved: boolean
  _e(): VNode
  _uid: number
  promiser: Promise<any>
  displayLoading: boolean
  readonly delay: number
  setupLoading(): void
}
export type SSFactory = SSAsyncFactory | SSFetchFactory

export const RESOLVED = 'resolved'
export const del = (af: SSFactory) => {
  const suspIns = af.suspenseInstance
  if (!suspIns) {
    // TODO: warn
    console.error('No Suspense instance')
    return
  }
  const asyncFactorys = suspIns.asyncFactorys

  asyncFactorys.delete(af)
  if (asyncFactorys.size === 0) {
    suspIns.$emit(RESOLVED)
  }
}
export const add = (af: SSFactory) => {
  const suspIns = currentSuspenseInstance || af.suspenseInstance
  if (!suspIns) {
    // TODO: warn
    console.error('No Suspense instance')
    return
  }
  const asyncFactorys =
    suspIns.asyncFactorys || (suspIns.asyncFactorys = new Set())
  console.log('suspIns_ID: ', suspIns._uid)
  if (suspIns.resolved) {
    suspIns.resolved = false
    suspIns.setupLoading()
  }
  asyncFactorys.add(af)
}
export const has = (af: SSFactory) => {
  const suspIns = currentSuspenseInstance || af.suspenseInstance
  if (!suspIns) {
    // TODO: warn
    console.error('No Suspense instance')
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
    }
  },
  created() {
    pushSuspenseInstance(this)
    // `this.promiser` is for test cases
    this.promiser = new Promise(resolve => {
      this.$on(RESOLVED, () => {
        if (this._timer) {
          clearTimeout(this._timer)
          this._timer = null
        }
        this.resolved = true
        this.displayLoading = false
        resolve()
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
    popSuspenseInstance()
  },
  render(this: SSVue, h: CreateElement) {
    console.log(this._uid)
    console.log(this.resolved)
    console.log('Suspense render')
    const isVisible =
      ((this.$options as any).suspense as SSOptions).mode === 'visible'
    const emptyVNode = this._e()
    const fallback = this.displayLoading
      ? this.$slots.fallback || [emptyVNode]
      : [emptyVNode]
    // The `tree` is the real content to be rendered
    const tree = this.$slots.default || [emptyVNode]

    const rendered = this.resolved
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
