import { useMemo } from "preact/hooks"

import { createDebounce } from "~/utils/createDebounce"

export const useDebounce = (delay: number) =>
  useMemo(() => createDebounce(delay), [delay])
