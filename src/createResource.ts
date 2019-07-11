import Vue from 'vue'
import { del, add, SSAsyncFactory, COMPONENT_NAME } from './Suspense'
import {
  currentInstance,
  currentSuspenseInstance,
  setCurrentInstance
} from './currentInstance'

Vue.mixin({
  created(this: Vue) {
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

interface Result<R, E> {
  $$promiser: Promise<R>
  $$result: R
  $$error: E
  $$loading: boolean
}
interface ResourceManager<I, R, E> {
  read(input: I): Promise<R>
  $result: R
  $error: E
  $loading: boolean
  fork(): ResourceManager<I, R, E>
}
interface ResourceOptions {
  prevent?: boolean
}
export default function createResource<I = any, R = any, E = any>(
  fetchFactory: SSAsyncFactory<I, R>,
  options?: ResourceOptions
): ResourceManager<I, R, E> {
  const $res: Result<R, E> = observable({
    $$result: null,
    $$error: null,
    $$loading: false
  })

  const ins = currentInstance as Vue
  if (currentSuspenseInstance) {
    fetchFactory.suspenseInstance = currentSuspenseInstance
  } else {
    let current = ins.$parent
    while (current) {
      if (current.$options.name === COMPONENT_NAME) {
        fetchFactory.suspenseInstance = current as Vue
        break
      } else {
        current = current.$parent
      }
    }
  }

  const hasSuspenseInstance = !!fetchFactory.suspenseInstance

  const resourceManager: ResourceManager<I, R, E> = {
    read(input: I) {
      if ($res.$$loading && options && options.prevent) {
        return $res.$$promiser
      }
      $res.$$loading = true
      // Because we don't need caching, this is just a unique identifier,
      // and each call to .read() is a completely new request.
      const uniqueWrapFactory = (i: I) => {
        return fetchFactory(i)
      }

      if (hasSuspenseInstance) {
        // Establish a relationship between the fetchFactory and the current component instance
        uniqueWrapFactory.suspenseInstance = fetchFactory.suspenseInstance
        add(uniqueWrapFactory)
      }

      // Start fetching asynchronous data
      const promise = ($res.$$promiser = uniqueWrapFactory(input))

      promise
        .then(res => {
          // Trigger update
          $res.$$result = res
          $res.$$loading = false
          if (hasSuspenseInstance) del(uniqueWrapFactory)
        })
        .catch((err: E) => {
          if (process.env.NODE_ENV !== 'production') {
            console.error(err)
          }
          $res.$$error = err
          $res.$$loading = false
          if (hasSuspenseInstance) del(uniqueWrapFactory, err)
        })

      return promise
    },
    get $result(): R {
      return $res.$$result
    },
    set $result(val: R) {
      $res.$$result = val
    },
    get $error(): E {
      return $res.$$error
    },
    set $error(val: E) {
      $res.$$error = val
    },
    get $loading(): boolean {
      return $res.$$loading
    },
    fork() {
      return createResource((i: I) => fetchFactory(i))
    }
  }

  return resourceManager
}
