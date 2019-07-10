import { CreateElement } from 'vue'

export default {
  name: 'TestComponent',
  render(h: CreateElement) {
    return h('div', { class: { 'test-component': true } }, 'test component')
  }
}
