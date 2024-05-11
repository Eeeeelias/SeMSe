import { Ref, cloneElement, isValidElement } from "preact"

import { forwardRef, HTMLAttributes } from "preact/compat"

import { cn } from "~/utils/cn"
import { useMergeRefs } from "~/utils/mergeRefs"

import { ChildrenProp } from "./BaseProps"

type AnyProps = Record<string, unknown>

const safeFn = (fn: unknown) => (typeof fn !== "function" ? undefined : fn)

const safeFnCall = (fn: unknown, args: unknown[]): unknown =>
  safeFn(fn)?.(...args)

const mergeFn = (slotFn: unknown, childFn: unknown) => {
  if (slotFn && childFn) {
    return (...args: unknown[]) => {
      safeFnCall(childFn, args)
      safeFnCall(slotFn, args)
    }
  }
  return childFn ?? slotFn
}

const safeObject = (obj: unknown) =>
  typeof obj !== "object" || obj === null ? {} : obj

const mergeObject = (slotObj: unknown, childObj: unknown) => {
  if (slotObj && childObj) {
    return { ...safeObject(slotObj), ...safeObject(childObj) }
  }
  return childObj ?? slotObj
}

const mergeProp = (
  propName: string,
  slotValue: unknown,
  childValue: unknown
) => {
  const isHandler = /^on[A-Z]/.test(propName)
  if (isHandler) {
    return mergeFn(slotValue, childValue)
  } else if (propName === "style") {
    return mergeObject(slotValue, childValue)
  } else if (propName === "className") {
    return cn([slotValue, childValue])
  }
  return childValue ?? slotValue
}

const mergeProps = (slotProps: AnyProps, childProps: AnyProps) => {
  const overrideProps = { ...childProps }

  for (const propName in childProps) {
    const slotValue = slotProps[propName]
    const childValue = childProps[propName]
    overrideProps[propName] = mergeProp(propName, slotValue, childValue)
  }

  return { ...slotProps, ...overrideProps }
}

export type SlotProps<ElementType extends HTMLElement> =
  HTMLAttributes<ElementType> & ChildrenProp

/** Merges props into a child element.
 *
 *  Note:
 *  - Currently supports merging `style`, `className` and event handlers
 *  - You can only pass exactly one child element to a `Slot`
 **/
export const Slot = forwardRef<HTMLElement, SlotProps<HTMLElement>>(
  (props, slotRef) => {
    const { children, ...slotProps } = props

    const childrenRef = isValidElement(children) ? children.ref : null
    const ref = useMergeRefs([slotRef, childrenRef])

    if (!isValidElement(children)) {
      const error = "Slot components expect exactly one child element."
      if (import.meta.env.DEV) throw new Error(error)
      console.error(error)

      return <div ref={slotRef as Ref<HTMLDivElement>}>{children}</div>
    }

    return cloneElement(children, {
      ...mergeProps(slotProps, children.props),
      ref,
    })
  }
)
