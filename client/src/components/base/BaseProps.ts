import { ComponentChildren, Ref } from "preact"

export interface RefProp<T extends Element> {
  ref?: Ref<T>
}

export interface ChildrenProp {
  children?: ComponentChildren
}

export interface ClassNameProp {
  className?: string
}
