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
  const suspIns = currentSuspenseInstance
  if (!suspIns) {
    // TODO: warn
    console.error('No Suspense instance')
    return
  }
  const asyncFactorys =
    suspIns.asyncFactorys || (suspIns.asyncFactorys = new Set())
  console.log('suspIns_ID: ', suspIns._uid)
  // suspIns.resolved = false
  asyncFactorys.add(af)
}
export const has = (af: SSFactory) => {
  const suspIns = currentSuspenseInstance
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
      resolved: false
    }
  },
  created() {
    this.promiser = new Promise(resolve => {
      pushSuspenseInstance(this)
      this.$on(RESOLVED, () => {
        this.resolved = true
        resolve()
      })
    })
  },
  mounted() {
    popSuspenseInstance()
  },
  beforeUpdate() {
    pushSuspenseInstance(this)
  },
  updated() {
    popSuspenseInstance()
  },
  render(this: SSVue, h: CreateElement) {
    console.log(this._uid)
    console.log(this.resolved)
    console.log('Suspense render')
    const emptyVNode = this._e()
    const fallback = this.$slots.fallback || [emptyVNode]
    // The `tree` is the real content to be rendered
    const tree = this.$slots.default || [emptyVNode]

    const rendered = this.resolved
      ? createWrapper(h, tree)
      : ((this.$options as any).suspense as SSOptions).mode === 'visible'
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
