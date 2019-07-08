import { CreateElement } from 'vue'
import createResource from '../../createResource'
import fetch from './fetch'

export default {
  name: 'CacheComponent2',
  data() {
    return {
      res: {}
    }
  },
  async created() {
    this.resource = createResource(() => fetch())
    // This.promiser is used in test cases, waiting for resource requests to complete
    this.promiser = this.resource.read()
    await this.promiser
    this.res = this.resource.$res.$$result
  },
  render(h: CreateElement) {
    return h(
      'div',
      { class: { 'cache-component-2': true } },
      JSON.stringify(this.res)
    )
  }
}
