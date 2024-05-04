import { cn } from "../../utils/cn"
import { focusRing, hstack } from "../../utils/styles"
import { ChildrenProp, ClassNameProp } from "../base/BaseProps"

export interface InputBorderProps extends ClassNameProp, ChildrenProp {
  label: string
}

export const InputBorder = ({
  label,
  className,
  children,
  ...delegated
}: InputBorderProps) => (
  <label
    {...delegated}
    className={cn(
      focusRing,
      hstack({ inline: true, gap: 2, align: "center" }),
      "border-stroke-gentle h-10 select-none whitespace-nowrap rounded border px-3",
      className
    )}
  >
    <span className="text-text-gentle text-sm font-semibold">{label}</span>
    <span className="bg-text-gentle inline-block size-1.5 rounded-full" />
    {children}
  </label>
)
