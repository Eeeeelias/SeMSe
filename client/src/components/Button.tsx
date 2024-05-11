import { VariantProps, cva } from "class-variance-authority"
import { forwardRef } from "preact/compat"

import { cn } from "~/utils/cn"

import {
  ChildrenProp,
  ClassNameProp,
  FocusHandlerProps,
} from "./base/BaseProps"

const button = cva("inline-flex items-center truncate whitespace-nowrap", {
  variants: {
    kind: {
      key: "text-text-surface bgl-base-background-surface hover:bgl-layer-b/10 focus-visible:bgl-layer-b/10 active:bgl-layer-b/20",
      ghost:
        "text-text bgl-base-transparent hover:bgl-layer-w/5 focus-visible:bgl-layer-w/5 active:bgl-layer-w/10 border-text-muted border",
      flat: "text-text bgl-base-transparent hover:bgl-layer-w/5 focus-visible:bgl-layer-w/5 active:bgl-layer-w/10",
    },
    round: {
      true: "rounded-full",
      false: "rounded",
    },
    size: {
      default: "h-10 shrink-0 gap-2 px-3",
      icon: "size-10 shrink-0 items-center justify-center",
    },
  },
  defaultVariants: {
    kind: "flat",
    round: false,
    size: "default",
  },
})

export interface ButtonProps
  extends VariantProps<typeof button>,
    FocusHandlerProps,
    ClassNameProp,
    ChildrenProp {
  onClick?: () => void
  tabIndex?: number
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, kind, round, size, className, ...delegated }, ref) => (
    <button
      ref={ref}
      className={cn(button({ kind, round, size }), className)}
      {...delegated}
    >
      {children}
    </button>
  )
)
Button.displayName = "Button"
