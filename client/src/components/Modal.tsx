/* eslint-disable jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/click-events-have-key-events */

import { useEffect, useRef } from "preact/hooks"

import { cn } from "~/utils/cn"
import { surface } from "~/utils/styles"

import { ChildrenProp, ClassNameProp } from "./base/BaseProps"
import { Icon } from "./base/Icon"
import { Portal } from "./base/Portal"
import { Button } from "./Button"

const isClickInside = (
  target: HTMLElement,
  { x, y }: { x: number; y: number }
) => {
  const { top, right, bottom, left } = target.getBoundingClientRect()
  return x >= left && x <= right && y >= top && y <= bottom
}

interface ModalRootProps extends ChildrenProp, ClassNameProp {
  onClose: () => void
}
const Root = ({ onClose, className, children }: ModalRootProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null)

  const handleClose = () => {
    dialogRef.current?.close()
    onClose()
  }

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    dialog.showModal()
    return () => {
      if (!dialog.open) return
      dialog.close()
    }
  }, [])

  return (
    <Portal>
      <dialog
        ref={dialogRef}
        className={cn(
          surface({ rounded: "lg", bg: "medium", shade: "high" }),
          "bg-background-page/75 shade-color-dark inset-0 overflow-visible [body:has(&)]:overflow-hidden",
          "backdrop:bg-black/50 backdrop:backdrop-blur-[2px]",
          className
        )}
        onClick={({ currentTarget, clientX, clientY }) => {
          if (isClickInside(currentTarget, { x: clientX, y: clientY })) return
          handleClose()
        }}
        onClose={onClose}
      >
        <div
          aria-hidden
          className="text-text-gentle pointer-events-none absolute left-1/2 top-0 m-auto -translate-x-1/2 -translate-y-8 text-nowrap text-sm font-bold"
        >
          Click outside to close
        </div>

        {children}

        <Button className="absolute right-1 top-1" onClick={handleClose}>
          <Icon icon="xmark" />
        </Button>
      </dialog>
    </Portal>
  )
}

export const Modal = {
  Root,
}
