import { SSVue } from './Suspense'

export let currentInstance: SSVue | null = null

export function setCurrentInstance(ins: SSVue) {
  currentInstance = ins
}

export const suspenseInstanceStack: SSVue[] = []
export let currentSuspenseInstance: SSVue
export function pushSuspenseInstance(ins: SSVue) {
  currentSuspenseInstance = ins
  suspenseInstanceStack.push(ins)
}

export function popSuspenseInstance(): SSVue | null {
  suspenseInstanceStack.pop()
  return (currentSuspenseInstance =
    suspenseInstanceStack[suspenseInstanceStack.length - 1])
}
