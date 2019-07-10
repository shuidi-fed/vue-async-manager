import Vue from 'vue'
import installer from '../index'
import lazy from '../lazy'
import TestComp from './__fixtures__/TestComponent'
import CacheComponent1 from './__fixtures__/CacheComponent'
import CacheComponent2 from './__fixtures__/CacheComponent2'
import CacheComponent3 from './__fixtures__/CacheComponent3'
import { dynamicImport } from './__fixtures__/fetch'
import Suspense from '../Suspense'

Vue.config.devtools = false
Vue.config.productionTip = false

describe('Mode(visible):', () => {
  Vue.use(installer)

  test('Nothing to wait', async () => {
    const ins = new Vue({
      components: { Suspense },
      render(h) {
        return h('Suspense', [
          h('div', { class: { fallback: true }, slot: 'fallback' }, 'loading'),
          h('p', 'static')
        ])
      }
    })

    ins.$mount()

    expect(ins.$el.outerHTML).toMatchSnapshot()

    await (ins.$children[0] as Vue).promiser

    expect(ins.$el.outerHTML).toMatchSnapshot()
  })

  test('Lazy component as a child of Suspense', async () => {
    const TestComponent = lazy(() => dynamicImport(TestComp))

    const ins = new Vue({
      components: {
        TestComponent
      },
      render(h) {
        return h('Suspense', [
          h('div', { class: { fallback: true }, slot: 'fallback' }, 'loading'),
          h('TestComponent'),
          h('p', 'static')
        ])
      }
    })

    ins.$mount()

    expect(ins.$el.outerHTML).toMatchSnapshot()

    await (ins.$children[0] as Vue).promiser

    expect(ins.$el.outerHTML).toMatchSnapshot()
  })

  test('Use resource cache in subcomponents of Suspense', async () => {
    const ins = new Vue({
      components: { CacheComponent1 },
      render(h) {
        return h('Suspense', [
          h('div', { class: { fallback: true }, slot: 'fallback' }),
          h('CacheComponent1')
        ])
      }
    })

    ins.$mount()

    expect(ins.$el.outerHTML).toMatchSnapshot()

    await (ins.$children[0] as Vue).promiser
    await (ins.$children[0].$children[0] as Vue).promiser

    expect(ins.$el.outerHTML).toMatchSnapshot()
  })

  test('Use both `lazy component` and `createResource` in Suspense', async () => {
    const TestComponent = lazy(() => dynamicImport(TestComp))

    const ins = new Vue({
      name: 'TreeComponent',
      components: {
        TestComponent,
        CacheComponent2
      },
      render(h) {
        return h('Suspense', [
          h('div', { class: { loading: true }, slot: 'fallback' }, 'loading'),
          h('TestComponent'),
          h('section', [h('CacheComponent2')])
        ])
      }
    })

    ins.$mount()

    expect(ins.$el.outerHTML).toMatchSnapshot()

    await (ins.$children[0] as Vue).promiser
    await (ins.$children[0].$children[1] as Vue).promiser

    expect(ins.$el.outerHTML).toMatchSnapshot()
  })

  test('Nested Suspense components', async () => {
    const TestComponent = lazy(() => dynamicImport(TestComp))

    const ins = new Vue({
      name: 'TreeComponent',
      components: {
        TestComponent,
        CacheComponent3
      },
      render(h) {
        return h('Suspense', [
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
