import { createPortal } from "preact/compat"

import { ChildrenProp } from "./BaseProps"

export const Portal = ({ children }: ChildrenProp) => {
  return createPortal(children, document.body)
}
