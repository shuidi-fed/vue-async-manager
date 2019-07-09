import { CreateElement } from 'vue'
import createResource from '../../createResource'
import fetch from './fetch'

export default {
  name: 'CacheComponent2',
  created() {
    this.$rm = createResource(() => fetch())
    // This.promiser is used in test cases, waiting for resource requests to complete
    this.promiser = this.$rm.read()
  },
  render(h: CreateElement) {
    return h(
      'div',
      { class: { 'cache-component-2': true } },
      JSON.stringify(this.$rm.$result)
    )
  }
}
