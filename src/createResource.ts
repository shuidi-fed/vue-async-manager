import Vue from 'vue'
import { del, add, has, SSFetchFactory, SSVue } from './Suspense'
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

export default function createResource(fetchFactory: SSFetchFactory) {
  const $res = observable({ $$result: null })

  return {
    read(...args: any[]) {
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
      const promise = fetchFactory(...args)
      $res.$$waiter = promise

      // tweak render
      const ins = currentInstance as any
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
