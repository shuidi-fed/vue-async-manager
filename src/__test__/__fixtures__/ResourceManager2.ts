import { CreateElement } from 'vue'
import createResource from '../../createResource'
import fetch from './fetch'

export default {
  name: 'ResourceManager',
  created() {
    this.$rm = createResource((mockData: any) => fetch(mockData), {
      prevent: true
    })

    this.promiser1 = this.$rm.read({ name: 'foo' })
    this.promiser2 = this.$rm.read({ name: 'bar' })

    this.$rm2 = createResource((mockData: any) => fetch(mockData))

    this.promiser3 = this.$rm2.read({ name: 'foo' })
    this.promiser4 = this.$rm2.read({ name: 'bar' })
  },
  render(h: CreateElement) {
    return h('div')
  }
}
