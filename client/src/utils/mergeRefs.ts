import { Ref } from "preact"

export const mergeRefs = <T extends Element>(
  ...refs: (Ref<T> | undefined | null)[]
): Ref<T> => {
  return element => {
    refs.forEach(ref => {
      if (typeof ref === "function") {
        ref(element)
      } else if (ref) {
        ref.current = element
      }
    })
  }
}
