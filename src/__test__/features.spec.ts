import Vue from 'vue'
import installer from '../index'
import lazy from '../lazy'
import TestComp from './__fixtures__/TestComponent'
import { dynamicImport } from './__fixtures__/fetch'
import { SSVue } from '../Suspense'

Vue.config.devtools = false
Vue.config.productionTip = false

Vue.use(installer)

describe('Lazy Error: ', () => {
  test('Lazy component failed to load', async () => {
    const TestComponent = lazy(() =>
      dynamicImport(TestComp, true /* throw Error */)
    )

    const ins = new Vue({
      components: {
        TestComponent
      },
      render(h) {
        return h('Suspense', [
          h('div', { class: { fallback: true }, slot: 'fallback' }, 'loading'),
          h('div', { class: { error: true }, slot: 'error' }, 'error'),
          h('TestComponent'),
          h('p', 'static')
        ])
      }
    })

    ins.$mount()

    expect(ins.$el.outerHTML).toMatchSnapshot()

    try {
      await (ins.$children[0] as SSVue).promiser
    } catch (err) {
      expect(ins.$el.outerHTML).toMatchSnapshot()
    }
  })
})

describe('Suspense event: ', () => {
  test('The resolved event should be triggered correctly', async () => {
    const TestComponent = lazy(() => dynamicImport(TestComp))

    const onResolved = jest.fn()
    const onRejected = jest.fn()

    const ins = new Vue({
      components: {
        TestComponent
      },
      render(h) {
        return h(
          'Suspense',
          {
            on: { resolved: onResolved, rejected: onRejected }
          },
          [h('TestComponent')]
        )
      }
    })

    ins.$mount()

    await (ins.$children[0] as SSVue).promiser

    expect(onResolved.mock.calls.length).toBe(1)
    expect(onRejected.mock.calls.length).toBe(0)
  })

  test('The rejected event should be triggered correctly', async () => {
    const TestComponent = lazy(() =>
      dynamicImport(TestComp, true /* throw Error */)
    )

    const onResolved = jest.fn()
    const onRejected = jest.fn()

    const ins = new Vue({
      components: {
        TestComponent
      },
      render(h) {
        return h(
          'Suspense',
          {
            on: { resolved: onResolved, rejected: onRejected }
          },
          [h('TestComponent')]
        )
      }
    })

    ins.$mount()

    try {
      await (ins.$children[0] as SSVue).promiser
    } catch (err) {
      expect(onResolved.mock.calls.length).toBe(0)
      expect(onRejected.mock.calls.length).toBe(1)
    }
  })
})
