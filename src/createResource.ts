import Vue from 'vue'
import { del, add, has, SSAsyncFactory, SSVue } from './Suspense'
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
  $$result: R
  $$waiter: Promise<R>
}
export default function createResource<I = any, R = any>(
  fetchFactory: SSAsyncFactory<I, R>
) {
  const $res: Result<R> = observable({ $$result: null })

  return {
    read(input: I) {
      // Returns `$res` if the relationship has been established
      if (has(fetchFactory)) return $res

      // Establish a relationship between the fetchFactory and the current component instance
      add(fetchFactory)
      fetchFactory.suspenseInstance =
        (currentSuspenseInstance as SSVue) || fetchFactory.suspenseInstance

      if (fetchFactory.resolved) {
        fetchFactory.res.$$waiter.then(() => {
          del(fetchFactory)
        })
        return fetchFactory.res
      }

      // Start fetching asynchronous data
      const promise = fetchFactory(input)
      $res.$$waiter = promise

      // tweak render
      const ins = currentInstance as SSVue
      const originalRender = ins._render
      ins._render = function() {
        console.log('Resource render')
        // Trigger get to collect dependencies
        $res.$$result
        return fetchFactory.resolved ? originalRender.call(ins) : ins._e()
      }

      promise.then(res => {
        fetchFactory.resolved = true
        fetchFactory.res = $res
        // Trigger update
        $res.$$result = res
        del(fetchFactory)
      })

      return $res
    }
  }
}
