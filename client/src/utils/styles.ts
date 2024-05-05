import { VariantProps, cva } from "class-variance-authority"

import { cn } from "./cn"

export const focusRing = cn(
  "outline-stroke-highlight outline-2 outline-offset-2 focus-visible:outline [&:has(*:focus-visible)]:outline"
)

const stack = cva("", {
  variants: {
    inline: {
      true: "inline-flex",
      false: "flex",
    },
    wrap: {
      true: "flex-wrap",
      false: "flex-nowrap",
    },
    direction: {
      row: "flex-row",
      column: "flex-col",
    },
    align: {
      start: "items-start",
      center: "items-center",
      end: "items-end",
    },
    justify: {
      start: "justify-start",
      center: "justify-center",
      end: "justify-end",
    },
    gap: {
      0: "gap-0",
      1: "gap-1",
      2: "gap-2",
      4: "gap-4",
      8: "gap-8",
    },
  },
  defaultVariants: {
    inline: false,
    align: "start",
    justify: "start",
    gap: 0,
    wrap: false,
  },
})

type StackProps = Omit<VariantProps<typeof stack>, "direction">

export const vstack = (props?: StackProps) =>
  stack({ direction: "column", ...props })

export const hstack = (props?: StackProps) =>
  stack({ direction: "row", ...props })

export const surface = cva("text-text border backdrop-blur", {
  variants: {
    bg: {
      dark: "bg-background-page/50 border-background/10",
      medium: "bg-background/50 border-background-surface/10",
      glassy: "bg-background-surface/10 border-text-priority/10",
    },
    round: {
      sm: "rounded",
      md: "rounded-md",
      lg: "rounded-lg",
    },
  },
  defaultVariants: {
    bg: "medium",
    round: "md",
  },
})
