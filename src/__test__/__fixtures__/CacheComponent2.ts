import { CreateElement } from 'vue'
import createResource from '../../createResource'
import fetch from './fetch'

const resource = createResource(() => fetch())

export default {
  name: 'CacheComponent2',
  data() {
    return {
      res: {}
    }
  },
  async created() {
    const res = resource.read()
    // This.promiser is used in test cases, waiting for resource requests to complete
    this.promiser = res.$$waiter
    await res.$$waiter
    this.res = res.$$result
  },
  render(h: CreateElement) {
    return h(
      'div',
      { class: { 'cache-component-2': true } },
      JSON.stringify(this.res)
    )
  }
}
