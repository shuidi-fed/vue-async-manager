import { Component } from 'vue'

export default (mockData?: any, throwError?: any) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      !throwError
        ? resolve(
            mockData || {
              code: 0,
              msg: 'success',
              data: {}
            }
          )
        : reject('request error')
    }, 1000)
  })
}

export function dynamicImport(
  Comp: Component,
  throwError: boolean = false
): Promise<Component> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      throwError ? reject('load error') : resolve(Comp)
    }, 1000)
  })
}
