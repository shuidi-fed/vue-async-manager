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
  $$result: R | null
}
interface Resource<I, R> {
  read(input: I): Promise<R>
  $res: Result<R>
}
export default function createResource<I = any, R = any>(
  fetchFactory: SSAsyncFactory<I, R>
) {
  const $res: Result<R> = observable({ $$result: null })

  // tweak render
  const ins = currentInstance as SSVue
  const originalRender = ins._render
  ins._render = function() {
    console.log('Resource render')
    // Trigger get to collect dependencies
    $res.$$result
    return fetchFactory.resolved ? originalRender.call(ins) : ins._e()
  }

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

  const resource: Resource<I, R> = {
    read(input: I) {
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
        del(uniqueWrapFactory)
      })

      return promise
    },
    $res
  }

  return resource
}
