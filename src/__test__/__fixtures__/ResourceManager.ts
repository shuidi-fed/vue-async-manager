import { CreateElement } from 'vue'
import createResource from '../../createResource'
import fetch from './fetch'

export default {
  name: 'ResourceManager',
  created() {
    this.$rm = createResource((mockData: any) => fetch(mockData))
    this.$rm2 = this.$rm.fork()

    this.promiser1 = this.$rm.read({ name: 'foo' })
    this.promiser2 = this.$rm2.read({ name: 'bar' })
  },
  render(h: CreateElement) {
    return h('div')
  }
}
