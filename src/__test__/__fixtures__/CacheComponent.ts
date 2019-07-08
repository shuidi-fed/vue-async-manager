import { CreateElement } from 'vue'
import createResource from '../../createResource'
import fetch from './fetch'

export default {
  name: 'CacheComponent',
  async created() {
    this.resource = createResource(() => fetch())
    // This.promiser is used in test cases, waiting for resource requests to complete
    this.promiser = this.resource.read()
  },
  render(h: CreateElement) {
    return h(
      'div',
      { class: { 'cache-component': true } },
      JSON.stringify(this.resource.$res.$$result)
    )
  }
}
