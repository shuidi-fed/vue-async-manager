import { CreateElement } from 'vue'

export default {
  name: 'TestComponent',
  render(h: CreateElement) {
    console.log('TestComponent render')
    return h('div', { class: { 'test-component': true } }, 'test component')
  }
}
