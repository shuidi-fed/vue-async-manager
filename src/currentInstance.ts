import { SSVue, RESOLVED } from './Suspense'

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
  if (!currentSuspenseInstance.asyncFactorys) {
    // This means that there are no lazy components or resource.read()
    // in the child components of the Suspense component,
    // set to resolved to update rendering.
    // Warning: If the content wrapped by the Suspense component is static, the static content will be rendered twice.
    currentSuspenseInstance.$emit(RESOLVED)
  }
  suspenseInstanceStack.pop()
  return (currentSuspenseInstance =
    suspenseInstanceStack[suspenseInstanceStack.length - 1])
}
