import { FunctionComponent } from "preact"

import { VariantProps, cva } from "class-variance-authority"

import { cn } from "../utils/cn"

const button = cva("inline-flex h-10 items-center rounded px-3", {
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
})

interface ButtonProps extends VariantProps<typeof button> {
  onClick?: () => void
  className?: string
}

export const Button: FunctionComponent<ButtonProps> = ({
  children,
  kind,
  className,
  ...delegated
}) => (
  <button className={cn(button({ kind }), className)} {...delegated}>
    {children}
  </button>
)
