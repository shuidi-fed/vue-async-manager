import Vue from 'vue'
import installer from '../index'
import ResourceManager from './__fixtures__/ResourceManager'
import ResourceManager2 from './__fixtures__/ResourceManager2'
import ResourceManagerError from './__fixtures__/ResourceManagerError'
import Suspense from '../Suspense'

Vue.config.devtools = false
Vue.config.productionTip = false

describe('Resource Manager:', () => {
  Vue.use(installer)

  test('Fork a resource manager', async () => {
    const ins = new Vue({
      components: { Suspense, ResourceManager },
      render(h) {
        return h('Suspense', [h('ResourceManager')])
      }
    })

    ins.$mount()

    const rmIns = ins.$children[0].$children[0] as any

    expect(rmIns.$rm.$loading).toBe(true)
    expect(rmIns.$rm2.$loading).toBe(true)

    await rmIns.promiser1
    await rmIns.promiser2

    expect(rmIns.$rm.$result).toEqual({ name: 'foo' })
    expect(rmIns.$rm2.$result).toEqual({ name: 'bar' })
    expect(rmIns.$rm.$loading).toBe(false)
    expect(rmIns.$rm2.$loading).toBe(false)
  })

  test('Resource manager - prevent option', async () => {
    const ins = new Vue({
      components: { Suspense, ResourceManager2 },
      render(h) {
        return h('Suspense', [h('ResourceManager2')])
      }
    })

    ins.$mount()

    const rmIns = ins.$children[0].$children[0] as any

    expect(rmIns.$rm.$loading).toBe(true)
    expect(rmIns.$rm2.$loading).toBe(true)

    await rmIns.promiser1
    await rmIns.promiser2
    await rmIns.promiser3
    await rmIns.promiser4

    expect(rmIns.$rm.$result).toEqual({ name: 'foo' })
    expect(rmIns.$rm2.$result).toEqual({ name: 'bar' })
    expect(rmIns.$rm.$loading).toBe(false)
    expect(rmIns.$rm2.$loading).toBe(false)
  })

  test('Resource manager - no Suspense component instance', async () => {
    const ins = new Vue({
      components: { ResourceManager },
      render(h) {
        return h('ResourceManager')
      }
    })

    ins.$mount()

    const rmIns = ins.$children[0] as any

    expect(rmIns.$rm.$loading).toBe(true)
    expect(rmIns.$rm2.$loading).toBe(true)

    await rmIns.promiser1
    await rmIns.promiser2
    await rmIns.promiser3
    await rmIns.promiser4

    expect(rmIns.$rm.$result).toEqual({ name: 'foo' })
    expect(rmIns.$rm2.$result).toEqual({ name: 'bar' })
    expect(rmIns.$rm.$loading).toBe(false)
    expect(rmIns.$rm2.$loading).toBe(false)
  })

  test('Resource manager - Error handling', async () => {
    const ins = new Vue({
      components: { ResourceManagerError },
      render(h) {
        return h('ResourceManagerError')
      }
    })

    ins.$mount()

    const rmIns = ins.$children[0] as any

    expect(rmIns.$rm.$loading).toBe(true)
    expect(rmIns.$rm.$result).toBe(null)
    expect(rmIns.$rm.$error).toBe(null)

    try {
      await rmIns.promiser
    } catch (err) {
      expect(rmIns.$rm.$loading).toBe(false)
      expect(rmIns.$rm.$result).toBe(null)
      expect(rmIns.$rm.$error).toBe('request error')
    }
  })
})
