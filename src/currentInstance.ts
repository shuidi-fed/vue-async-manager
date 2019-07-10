import Vue from 'vue'

export let currentInstance: Vue | null = null

export function setCurrentInstance(ins: Vue) {
  currentInstance = ins
}

export const suspenseInstanceStack: Vue[] = []
export let currentSuspenseInstance: Vue
export function pushSuspenseInstance(ins: Vue) {
  currentSuspenseInstance = ins
  suspenseInstanceStack.push(ins)
}

export function popSuspenseInstance(): Vue | null {
  suspenseInstanceStack.pop()
  return (currentSuspenseInstance =
    suspenseInstanceStack[suspenseInstanceStack.length - 1])
}
