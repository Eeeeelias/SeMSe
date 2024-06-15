import { cn } from "~/utils/cn"

import { ChildrenProp, ClassNameProp } from "./base/BaseProps"

export const Quote = ({
  children,
  className,
}: ChildrenProp & ClassNameProp) => (
  <blockquote
    className={cn(
      "text-text text-md border-text-gentle border-l pl-2 italic",
      className
    )}
  >
    {children}
  </blockquote>
)
