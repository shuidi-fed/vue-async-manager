import { CreateElement } from 'vue'
import createResource from '../../createResource'
import fetch from './fetch'

export default {
  name: 'ResourceManager',
  created() {
    this.$rm = createResource((mockData: any) =>
      fetch(mockData, true /* throw error */)
    )

    this.promiser = this.$rm.read({ name: 'foo' })
  },
  render(h: CreateElement) {
    return h('div')
  }
}
