import {
  useFloating as useFloatingUI,
  autoUpdate,
  offset,
  flip,
  shift,
  Placement,
  Middleware,
  Side,
} from "@floating-ui/react"
import { useCallback, useMemo, useState } from "preact/hooks"

const sides = new Set(["top", "right", "bottom", "left"])
export const getSide = (placement: Placement) => {
  const side = placement.split("-")[0]
  return sides.has(side) ? (side as Side) : "bottom"
}

const defaultMiddleware = [
  offset(4),
  shift({ padding: 4 }),
  flip({ padding: 4 }),
]

export interface FloatingOptions {
  initialOpen?: boolean
  modal?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
  placement?: Placement
  middleware?: (Middleware | null | undefined | false)[]
}

export const useFloating = ({
  initialOpen = false,
  placement,
  modal,
  middleware = [],
  open: controlledOpen,
  onOpenChange: setControlledOpen,
}: FloatingOptions) => {
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
    middleware: [...defaultMiddleware, ...middleware],
  })

  return useMemo(
    () => ({
      open,
      setOpen,
      ...data,
      modal,
    }),
    [open, setOpen, data, modal]
  )
}
