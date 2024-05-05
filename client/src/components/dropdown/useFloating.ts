import {
  useFloating as useFloatingUI,
  autoUpdate,
  offset,
  flip,
  shift,
  Placement,
  arrow,
} from "@floating-ui/react"
import { useCallback, useMemo, useState } from "preact/hooks"

const OFFSET = 4

interface MiddlewareOptions {
  placement?: Placement
  arrowRef?: Element | null
}
const getMiddlewares = ({
  placement = "bottom",
  arrowRef,
}: MiddlewareOptions) => [
  offset(state => {
    if (!arrowRef) return OFFSET
    const side = state.placement.split("-")[0]
    const { clientHeight, clientWidth } = arrowRef
    const arrowOffset =
      side === "top" || side === "bottom" ? clientHeight : clientWidth
    return OFFSET + arrowOffset
  }),
  shift({ padding: 4 }),
  flip({
    crossAxis: placement.includes("-"),
    fallbackAxisSideDirection: "end",
    padding: 4,
  }),
  arrowRef ? arrow({ element: arrowRef }) : undefined,
]

export interface FloatingOptions extends Omit<MiddlewareOptions, "arrowRef"> {
  initialOpen?: boolean
  modal?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export const useFloating = ({
  initialOpen = false,
  placement,
  modal,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
}: FloatingOptions) => {
  const [arrowRef, setArrowRef] = useState<Element | null>(null)
  const [uncontrolledOpen, setUncontrolledOpen] = useState(initialOpen)

  const isControlled = controlledOpen != null
  const open = isControlled ? controlledOpen : uncontrolledOpen

  const setOpen = useCallback(
    (open: boolean) => {
      setUncontrolledOpen(open)
      setControlledOpen?.(open)
    },
    [setControlledOpen]
  )

  const data = useFloatingUI({
    placement,
    open,
    onOpenChange: setOpen,
    whileElementsMounted: autoUpdate,
    middleware: getMiddlewares({ placement, arrowRef }),
  })

  return useMemo(
    () => ({
      setArrowRef,
      open,
      setOpen,
      ...data,
      modal,
    }),
    [open, setOpen, data, modal]
  )
}
