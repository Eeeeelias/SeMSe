import { Ref, RefCallback } from "preact"

import { useMemo } from "preact/hooks"

export const mergeRefs = <T>(
  ...refs: (Ref<T> | undefined | null)[]
): RefCallback<T> | undefined => {
  if (refs.every(ref => ref == null)) {
    return
  }

  return value => {
    refs.forEach(ref => {
      if (typeof ref === "function") {
        ref(value)
      } else if (ref != null) {
        ref.current = value
      }
    })
  }
}

export const useMergeRefs = <T>(
  refs: (Ref<T> | undefined | null)[]
): RefCallback<T> | undefined =>
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useMemo(() => mergeRefs(...refs), refs)
