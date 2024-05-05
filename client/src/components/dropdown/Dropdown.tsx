import { JSX, createContext } from "preact"

import {
  useFloating,
  autoUpdate,
  offset,
  flip,
  shift,
  useClick,
  useDismiss,
  useRole,
  useInteractions,
  Placement,
  FloatingPortal,
  FloatingFocusManager,
  useTransitionStatus,
  Side,
} from "@floating-ui/react"
import { cva } from "class-variance-authority"
import { forwardRef } from "preact/compat"
import { useContext, useMemo, useState } from "preact/hooks"

import { cn } from "../../utils/cn"
import { useMergeRefs } from "../../utils/mergeRefs"
import { surface, vstack } from "../../utils/styles"
import { AsChildProp, ChildrenProp } from "../base/BaseProps"
import { Slot } from "../base/Slot"

interface DropdownOptions {
  initialOpen?: boolean
  placement?: Placement
  modal?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function useDropdown({
  initialOpen = false,
  placement = "bottom",
  modal,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
}: DropdownOptions = {}) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(initialOpen)

  const open = controlledOpen ?? uncontrolledOpen
  const setOpen = setControlledOpen ?? setUncontrolledOpen

  const data = useFloating({
    placement,
    open,
    onOpenChange: setOpen,
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(4),
      flip({
        crossAxis: placement.includes("-"),
        fallbackAxisSideDirection: "end",
        padding: 4,
      }),
      shift({ padding: 4 }),
    ],
  })

  const context = data.context

  const click = useClick(context, {
    enabled: controlledOpen == null,
  })
  const dismiss = useDismiss(context)
  const role = useRole(context)

  const interactions = useInteractions([click, dismiss, role])

  return useMemo(
    () => ({
      open,
      setOpen,
      ...interactions,
      ...data,
      modal,
    }),
    [open, setOpen, interactions, data, modal]
  )
}

type ContextType = ReturnType<typeof useDropdown> | null

const DropdownContext = createContext<ContextType>(null)

export const useDropdownContext = () => {
  const context = useContext(DropdownContext)

  if (context == null) {
    throw new Error(
      "Dropdown components must be wrapped in a <Dropdown.Root /> element"
    )
  }

  return context
}

export const Root = ({
  children,
  modal = false,
  ...restOptions
}: DropdownOptions & ChildrenProp) => {
  const dropdown = useDropdown({ modal, ...restOptions })
  return (
    <DropdownContext.Provider value={dropdown}>
      {children}
    </DropdownContext.Provider>
  )
}

type DropdownTriggerProps = ChildrenProp &
  AsChildProp &
  JSX.IntrinsicElements["button"]

export const Trigger = forwardRef<HTMLElement, DropdownTriggerProps>(
  ({ children, asChild = false, ...triggerProps }, ref) => {
    const context = useDropdownContext()
    const refs = useMergeRefs([context.refs.setReference, ref])

    const props = context.getReferenceProps(triggerProps)

    const Element = asChild ? Slot : "button"
    return (
      <Element ref={refs} {...props}>
        {children}
      </Element>
    )
  }
)

const transition = cva(
  "ease-bounce transition-[opacity,transform,margin] duration-200",
  {
    variants: {
      side: {
        top: "origin-bottom",
        bottom: "origin-top",
        left: "origin-right",
        right: "origin-left",
      },
      open: {
        true: "m-0 scale-100 opacity-100",
        false: "pointer-events-none opacity-0",
      },
    },
    compoundVariants: [
      {
        open: false,
        side: "top",
        className: "mb-0 scale-y-50",
      },
      {
        open: false,
        side: "bottom",
        className: "my-0 scale-y-50",
      },
      {
        open: false,
        side: "left",
        className: "mr-0 scale-x-50",
      },
      {
        open: false,
        side: "right",
        className: "ml-0 scale-x-50",
      },
    ],
  }
)

export const Content = ({
  style,
  ref: propRef,
  className,
  ...props
}: JSX.IntrinsicElements["div"]) => {
  const { context: floatingContext, ...context } = useDropdownContext()
  const ref = useMergeRefs([context.refs.setFloating, propRef])
  const { isMounted, status } = useTransitionStatus(floatingContext, {
    duration: 200,
  })

  if (!isMounted) return null

  const side = context.placement.split("-")[0] as Side

  return (
    <FloatingPortal>
      <FloatingFocusManager context={floatingContext} modal={context.modal}>
        <div
          ref={ref}
          style={{
            ...context.floatingStyles,
            ...(typeof style === "object" ? style : {}),
          }}
          {...context.getFloatingProps(props)}
        >
          <div
            className={cn([
              surface({ bg: "glassy", round: "sm" }),
              vstack(),
              transition({ side, open: status === "open" }),
              "shade-medium",
              className,
            ])}
          >
            {props.children}
          </div>
        </div>
      </FloatingFocusManager>
    </FloatingPortal>
  )
}

export const Close = ({
  onClick,
  ...props
}: JSX.IntrinsicElements["button"]) => {
  const { setOpen } = useDropdownContext()
  return (
    <button
      type="button"
      {...props}
      onClick={event => {
        onClick?.(event)
        setOpen(false)
      }}
    />
  )
}

export const Dropdown = {
  Root,
  Content,
  Close,
  Trigger,
}
