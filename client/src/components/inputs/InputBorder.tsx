import { cn } from "../../utils/cn"
import { focusRing, hstack } from "../../utils/styles"
import { ChildrenProp, ClassNameProp } from "../base/BaseProps"
import { Icon, IconName } from "../base/Icon"

type AlertKind = "error" | "warn" | "info" | "success"
const alertVariants: Record<
  AlertKind,
  { iconName: IconName; color: string; border: string }
> = {
  error: {
    iconName: "warn",
    color: "text-alert-error",
    border: "border-alert-error",
  },
  warn: {
    iconName: "warn",
    color: "text-alert-warning",
    border: "border-alert-warning",
  },
  info: {
    iconName: "info",
    color: "text-alert-info",
    border: "border-alert-info",
  },
  success: {
    iconName: "check",
    color: "text-alert-success",
    border: "border-alert-success",
  },
}

export interface AlertProps {
  kind: AlertKind
  text: string
}
const AlertIcon = ({ kind, text }: AlertProps) => {
  const { iconName, color } = alertVariants[kind]
  return (
    <span
      title={text}
      className={cn(
        hstack({ align: "center", justify: "center" }),
        "h-full w-8"
      )}
    >
      <Icon icon={iconName} className={color} />
    </span>
  )
}

export interface InputBorderProps extends ClassNameProp, ChildrenProp {
  label: string
  alert?: AlertProps
}

export const InputBorder = ({
  label,
  className,
  children,
  alert,
  ...delegated
}: InputBorderProps) => (
  <label
    {...delegated}
    className={cn(
      focusRing,
      hstack({ inline: true, align: "center" }),
      "border-stroke-gentle h-10 select-none whitespace-nowrap rounded border",
      alert ? "pl-3" : "px-3",
      alert && alertVariants[alert.kind].border,
      className
    )}
  >
    <span className="text-text-gentle text-sm font-semibold">{label}</span>
    <span className="bg-text-gentle mx-2 inline-block size-1.5 rounded-full" />
    {children}
    {alert && <AlertIcon {...alert} />}
  </label>
)
