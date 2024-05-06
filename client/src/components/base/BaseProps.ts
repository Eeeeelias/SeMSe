import { ComponentChildren } from "preact"

export interface ChildrenProp {
  children?: ComponentChildren
}

export interface ClassNameProp {
  className?: string
}

export interface AsChildProp {
  asChild?: boolean
}

export interface FocusHandlerProps {
  onBlur?: () => void
  onFocus?: () => void
}
