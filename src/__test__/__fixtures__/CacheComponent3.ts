import { CreateElement } from 'vue'
import createResource from '../../createResource'
import fetch from './fetch'

export default {
  name: 'CacheComponent3',
  created() {
    this.$rm = createResource(() => fetch())
    // this.promiser is used in test cases, waiting for resource requests to complete
    this.promiser = this.$rm.read()
  },
  render(h: CreateElement) {
    console.log('CacheComponent render')
    return h(
      'div',
      { class: { 'cache-component-3': true } },
      JSON.stringify(this.$rm.$result)
    )
  }
}
