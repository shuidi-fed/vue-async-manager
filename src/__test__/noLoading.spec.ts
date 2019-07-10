import Vue from 'vue'
import installer from '../index'
import lazy from '../lazy'
import TestComp from './__fixtures__/TestComponent'
import CacheComponent3 from './__fixtures__/CacheComponent3'
import { dynamicImport } from './__fixtures__/fetch'

Vue.config.devtools = false
Vue.config.productionTip = false

describe('Loading:', () => {
  Vue.use(installer)

  test('Nested Suspense components', async () => {
    const TestComponent = lazy(() => dynamicImport(TestComp))

    const ins = new Vue({
      name: 'TreeComponent',
      components: {
        TestComponent,
        CacheComponent3
      },
      render(h) {
        return h('Suspense', { props: { delay: 10000 } }, [
          h('div', { class: { loading: true }, slot: 'fallback' }, 'loading'),
          h('TestComponent'),
          h('Suspense', [h('CacheComponent3')])
        ])
      }
    })

    ins.$mount()

    expect(ins.$el.outerHTML).toMatchSnapshot()

    await (ins.$children[0] as Vue).promiser
    await (ins.$children[0].$children[1] as Vue).promiser
    await (ins.$children[0].$children[1].$children[0] as Vue).promiser

    expect(ins.$el.outerHTML).toMatchSnapshot()
  })
})
