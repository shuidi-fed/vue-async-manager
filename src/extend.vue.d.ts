import { VNode } from 'vue'
import { SSAsyncFactory, SSComponent } from './Suspense'

declare module 'vue/types/vue' {
  interface Vue {
    asyncFactorys: Set<SSAsyncFactory<any, SSComponent>>
    resolved: boolean
    _e(): VNode
    _uid: number
    _render(createElement: typeof Vue.prototype.$createElement): VNode
    promiser: Promise<any>
    displayLoading: boolean
    readonly delay: number
    setupLoading(): void
    _self: Vue
    [key: string]: any
  }
}
