import { CreateElement } from 'vue'

export default {
  name: 'TestHocComponent',
  props: ['title'],
  render(h: CreateElement) {
    return h(
      'div',
      {
        class: { 'test-hoc-component': true }
      },
      [`${this.title}`, this.$slots.default]
    )
  }
}
