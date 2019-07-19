import Vue from 'vue'
import { COMPONENT_NAME } from './Suspense'

export default function findSuspenseInstance(ins: Vue) {
  let current = ins.$parent
  while (current) {
    if (current.$options.name === COMPONENT_NAME) {
      return current as Vue
      break
    } else {
      current = current.$parent
    }
  }
  return
}
