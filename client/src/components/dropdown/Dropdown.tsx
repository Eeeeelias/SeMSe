import { JSX, createContext } from "preact"

import {
  FloatingPortal,
  FloatingFocusManager,
  useTransitionStatus,
  Side,
} from "@floating-ui/react"
import { cva } from "class-variance-authority"
import { forwardRef } from "preact/compat"
import { useContext } from "preact/hooks"

import { useDropdown, DropdownOptions } from "./useDropdown"
import { cn } from "../../utils/cn"
import { useMergeRefs } from "../../utils/mergeRefs"
import { surface } from "../../utils/styles"
import { ChildrenProp } from "../base/BaseProps"
import { Slot } from "../base/Slot"

type ContextType = ReturnType<typeof useDropdown> | null

const DropdownContext = createContext<ContextType>(null)

const useDropdownContext = () => {
  const context = useContext(DropdownContext)

  if (context == null) {
    throw new Error(
      "Dropdown components must be wrapped in a <Dropdown.Root /> element"
    )
  }

  return context
}

const Root = ({
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

type DropdownTriggerProps = ChildrenProp

const Trigger = forwardRef<HTMLElement, DropdownTriggerProps>(
  ({ children, ...triggerProps }, ref) => {
    const context = useDropdownContext()
    const refs = useMergeRefs([context.refs.setReference, ref])

    const props = context.getReferenceProps(triggerProps)

    return (
      <Slot ref={refs} {...props}>
        {children}
      </Slot>
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

const Content = ({
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
              surface({ bg: "glassy", shade: "medium" }),
              transition({ side, open: status === "open" }),
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

interface CloseProps extends ChildrenProp {
  onClick?: () => void
}

const Close = ({ onClick, ...props }: CloseProps) => {
  const { setOpen } = useDropdownContext()
  return (
    <Slot
      {...props}
      onClick={() => {
        onClick?.()
        setOpen(false)
      }}
    />
  )
}

const ArrowSvg = ({ side }: { side: Side }) => {
  const viewBox = {
    top: "0 0 16 8",
    bottom: "0 0 16 8",
    left: "0 0 8 16",
    right: "0 0 8 16",
  }[side]

  const path = {
    top: <polyline points="0 0 8 8 16 0" />,
    bottom: <polyline points="0 8 8 0 16 8" />,
    left: <polyline points="0 0 8 8 0 16" />,
    right: <polyline points="8 0 0 8 8 16" />,
  }[side]

  return (
    <svg
      viewBox={viewBox}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className=" fill-[#40455b]"
    >
      {path}
    </svg>
  )
}

const arrow = cva("absolute inline-block", {
  variants: {
    side: {
      top: `-bottom-2 h-2 w-4`,
      bottom: `-top-2 h-2 w-4`,
      left: `-right-2 h-4 w-2`,
      right: `-left-2 h-4 w-2`,
    },
  },
})

const Arrow = () => {
  const { setArrowRef, middlewareData, placement } = useDropdownContext()
  const side = placement.split("-")[0] as Side

  return (
    <span
      ref={setArrowRef}
      className={cn(arrow({ side }))}
      style={{
        left: middlewareData.arrow?.x,
        top: middlewareData.arrow?.y,
      }}
    >
      <ArrowSvg side={side} />
    </span>
  )
}

export const Dropdown = {
  Root,
  Content,
  Close,
  Trigger,
  Arrow,
}
