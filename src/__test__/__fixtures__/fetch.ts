import { Component } from 'vue'

export default () => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        code: 0,
        msg: 'success',
        data: {}
      })
    }, 1000)
  })
}

export function dynamicImport(Comp: Component): Promise<Component> {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(Comp)
    }, 1000)
  })
}
