import Vue from 'vue'
import { del, add, SSAsyncFactory, SSVue } from './Suspense'
import {
  currentInstance,
  currentSuspenseInstance,
  setCurrentInstance
} from './currentInstance'

Vue.mixin({
  created(this: SSVue) {
    setCurrentInstance(this)
  }
})

function observable(data: any) {
  if (Vue.observable) {
    return Vue.observable(data)
  }
  return new Vue({
    data() {
      return data
    }
  }).$data
}

interface Result<R> {
  $$result: R | null
  $$waiter: Promise<R>
}
export default function createResource<I = any, R = any>(
  fetchFactory: SSAsyncFactory<I, R>
) {
  const $res: Result<R> = observable({ $$result: null })

  return {
    read(input: I) {
      // Because we don't need caching, this is just a unique identifier,
      // and each call to .read() is a completely new request.
      const uniqueWrapFactory: SSAsyncFactory<I, R> = (i: I): Promise<R> => {
        return fetchFactory(i)
      }

      // Establish a relationship between the fetchFactory and the current component instance
      add(uniqueWrapFactory)
      uniqueWrapFactory.suspenseInstance = currentSuspenseInstance as SSVue

      // Start fetching asynchronous data
      const promise = uniqueWrapFactory(input)
      $res.$$waiter = promise

      // tweak render
      const ins = currentInstance as SSVue
      const originalRender = ins._render
      ins._render = function() {
        console.log('Resource render')
        // Trigger get to collect dependencies
        $res.$$result
        return uniqueWrapFactory.resolved ? originalRender.call(ins) : ins._e()
      }

      promise.then(res => {
        uniqueWrapFactory.resolved = true
        uniqueWrapFactory.res = $res
        // Trigger update
        $res.$$result = res
        del(uniqueWrapFactory)
      })

      return $res
    }
  }
}
