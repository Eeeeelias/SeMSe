import { VariantProps, cva } from "class-variance-authority"
import { forwardRef } from "preact/compat"

import { ChildrenProp, ClassNameProp } from "./base/BaseProps"
import { cn } from "../utils/cn"

const button = cva(
  "inline-flex h-10 items-center gap-2 whitespace-nowrap rounded px-3",
  {
    variants: {
      kind: {
        key: "text-text-surface bgl-base-background-highlight hover:bgl-layer-b/10 focus-visible:bgl-layer-b/10 active:bgl-layer-b/20",
        ghost:
          "text-text bgl-base-transparent hover:bgl-layer-w/5 focus-visible:bgl-layer-w/5 active:bgl-layer-w/10 border-text-muted border",
        flat: "text-text bgl-base-transparent hover:bgl-layer-w/5 focus-visible:bgl-layer-w/5 active:bgl-layer-w/10",
      },
    },
    defaultVariants: {
      kind: "flat",
    },
  }
)

interface ButtonProps
  extends VariantProps<typeof button>,
    ClassNameProp,
    ChildrenProp {
  onClick?: () => void
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, kind, className, ...delegated }, ref) => (
    <button
      ref={ref}
      className={cn(button({ kind }), className)}
      {...delegated}
    >
      {children}
    </button>
  )
)
Button.displayName = "Button"
