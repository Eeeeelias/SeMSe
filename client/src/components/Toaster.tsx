import { createAtom, useAtomValue } from "@yaasl/preact"
import { keyframes } from "goober"

import { cn } from "~/utils/cn"
import { createId } from "~/utils/createId"
import { surface } from "~/utils/styles"

import { Icon } from "./base/Icon"
import { Portal } from "./base/Portal"
import { Button } from "./Button"

const kinds = {
  info: { icon: "badge-info", duration: 5000 },
  success: { icon: "badge-check", duration: 5000 },
  warn: { icon: "badge-alert", duration: 0 },
  error: { icon: "badge-x", duration: 0 },
} as const

interface ToastProps {
  kind: "info" | "success" | "warn" | "error"
  title: string
  message?: string
  duration?: number
}

interface ToastState extends ToastProps {
  id: string
}

const toastsAtom = createAtom<ToastState[]>({
  name: "toasts",
  defaultValue: [],
})

const removeToast = (id: string) => {
  toastsAtom.set(toasts => toasts.filter(toast => toast.id !== id))
}

export const toast = ({
  kind,
  duration = kinds[kind].duration,
  ...props
}: ToastProps) => {
  const id = createId()
  toastsAtom.set(toasts => [...toasts, { id, kind, duration, ...props }])

  if (duration < 1) return
  setTimeout(() => {
    removeToast(id)
  }, duration)
}

const shrink = keyframes`
  0% {
    left: 0.5rem;
    right: 0.5rem;
    bottom: 0.125rem;
  }
  100% {
    left: 100%;
    right: 0.5rem;
    bottom: 0.125rem;
  }
`

const Toast = ({ id, kind, title, message, duration }: ToastState) => {
  const { icon } = kinds[kind]

  return (
    <div
      className={cn(
        "relative flex w-72 p-1",
        surface({ rounded: "md", shade: "low" }),
        "bg-black/15",
        {
          error: "border-alert-error/25",
          warn: "border-alert-warn/25",
          success: "border-alert-success/25",
          info: "border-alert-info/25",
        }[kind]
      )}
    >
      <div className="flex size-10 items-center justify-center">
        <Icon icon={icon} color={kind} size="lg" />
      </div>
      <div className="my-2 flex-1 overflow-hidden">
        <div className="text-text-priority truncate">{title}</div>
        {message && (
          <div className="text-text mt-1 line-clamp-3 text-sm">{message}</div>
        )}
      </div>
      <Button kind="flat" size="icon" onClick={() => removeToast(id)}>
        <Icon icon="xmark" />
      </Button>
      <span
        className={cn(
          "absolute h-0.5 rounded",
          {
            error: "bg-alert-error",
            warn: "bg-alert-warn",
            success: "bg-alert-success",
            info: "bg-alert-info",
          }[kind]
        )}
        style={{
          animation: `${shrink} ${duration ?? 0}ms linear forwards`,
        }}
      />
    </div>
  )
}

export const Toaster = () => {
  const toasts = useAtomValue(toastsAtom)

  return (
    <Portal>
      <div className="fixed bottom-0 right-0 z-50 flex flex-col gap-2 p-4">
        {toasts.map(toast => (
          <Toast key={toast.id} {...toast} />
        ))}
      </div>
    </Portal>
  )
}
