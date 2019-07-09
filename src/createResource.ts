import Vue from 'vue'
import { del, add, SSAsyncFactory, SSVue, COMPONENT_NAME } from './Suspense'
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
  $$loading: boolean
}
interface ResourceManager<I, R> {
  read(input: I): Promise<R>
  $result: R
  $loading: boolean
  fork(): ResourceManager<I, R>
}
export default function createResource<I = any, R = any>(
  fetchFactory: SSAsyncFactory<I, R>
) {
  const $res: Result<R> = observable({ $$result: null, $$loading: false })

  const ins = currentInstance as SSVue
  if (currentSuspenseInstance) {
    fetchFactory.suspenseInstance = currentSuspenseInstance
  } else {
    let current = ins.$parent
    while (current) {
      if (current.$options.name === COMPONENT_NAME) {
        fetchFactory.suspenseInstance = current as SSVue
        break
      } else {
        current = current.$parent
      }
    }
  }

  const resourceManager: ResourceManager<I, R> = {
    read(input: I) {
      $res.$$loading = true
      // Because we don't need caching, this is just a unique identifier,
      // and each call to .read() is a completely new request.
      const uniqueWrapFactory = (i: I) => {
        return fetchFactory(i)
      }

      // Establish a relationship between the fetchFactory and the current component instance
      uniqueWrapFactory.suspenseInstance = fetchFactory.suspenseInstance
      add(uniqueWrapFactory)

      // Start fetching asynchronous data
      const promise = uniqueWrapFactory(input)

      promise.then(res => {
        fetchFactory.resolved = true
        // Trigger update
        $res.$$result = res
        $res.$$loading = false
        del(uniqueWrapFactory)
      })

      return promise
    },
    get $result() {
      return $res.$$result
    },
    set $result(val) {
      $res.$$result = val
    },
    get $loading() {
      return $res.$$loading
    },
    fork() {
      return createResource((i: I) => fetchFactory(i))
    }
  }

  return resourceManager
}
