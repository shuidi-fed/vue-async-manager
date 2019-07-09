import Vue from 'vue'
import installer from '../index'
import ResourceManager from './__fixtures__/ResourceManager'
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
})
