import { ComponentChildren } from "preact"

import { VariantProps, cva } from "class-variance-authority"

import { cn } from "~/utils/cn"

import { ClassNameProp } from "./BaseProps"

const icon = cva("inline-block shrink-0", {
  variants: {
    size: {
      sm: "size-3",
      md: "size-4",
      lg: "size-5",
      xl: "size-6",
    },
    fill: {
      true: "fill-current",
      false: "fill-transparent",
    },
    color: {
      default: "text-text",
      gentle: "text-text-gentle",
      highlight: "text-text-highlight",
      surface: "text-text-surface",

      info: "text-alert-info",
      warn: "text-alert-warn",
      error: "text-alert-error",
      success: "text-alert-success",
    },
  },
  defaultVariants: {
    size: "md",
    fill: false,
  },
})

interface IconProps extends ClassNameProp, VariantProps<typeof icon> {
  icon: IconName
}

export const Icon = ({
  icon: iconName,
  className,
  fill,
  size,
  color,
  ...delegated
}: IconProps) => {
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  const { path } = icons[iconName]
  return (
    <svg
      className={cn(icon({ fill, size, color }), className)}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      stroke={"currentColor"}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...delegated}
    >
      {path}
    </svg>
  )
}

export type IconName = keyof typeof icons
interface IconDefintion {
  iconName: string
  path: ComponentChildren
}

const icons = {
  search: {
    iconName: "search",
    path: (
      <>
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </>
    ),
  },
  github: {
    iconName: "github",
    path: (
      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
    ),
  },
  sun: {
    iconName: "sun",
    path: (
      <>
        <circle cx="12" cy="12" r="5" />
        <line x1="12" y1="1" x2="12" y2="3" />
        <line x1="12" y1="21" x2="12" y2="23" />
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
        <line x1="1" y1="12" x2="3" y2="12" />
        <line x1="21" y1="12" x2="23" y2="12" />
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
      </>
    ),
  },
  moon: {
    iconName: "moon",
    path: <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />,
  },
  check: {
    iconName: "check",
    path: <polyline points="20 6 9 17 4 12" />,
  },
  info: {
    iconName: "info",
    path: (
      <>
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
      </>
    ),
  },
  warn: {
    iconName: "warn",
    path: (
      <>
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </>
    ),
  },
  plus: {
    iconName: "plus",
    path: (
      <>
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </>
    ),
  },
  "plus-circle": {
    iconName: "plus-circle",
    path: (
      <>
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="16"></line>
        <line x1="8" y1="12" x2="16" y2="12"></line>
      </>
    ),
  },
  minus: {
    iconName: "minus",
    path: <line x1="5" y1="12" x2="19" y2="12" />,
  },
  "minus-circle": {
    iconName: "minus-circle",
    path: (
      <>
        <circle cx="12" cy="12" r="10" />
        <line x1="8" y1="12" x2="16" y2="12" />
      </>
    ),
  },
  xmark: {
    iconName: "xmark",
    path: (
      <>
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </>
    ),
  },
  xcircle: {
    iconName: "xcircle",
    path: (
      <>
        <circle cx="12" cy="12" r="10" />
        <line x1="15" y1="9" x2="9" y2="15" />
        <line x1="9" y1="9" x2="15" y2="15" />
      </>
    ),
  },
  "caret-up": {
    iconName: "caret-up",
    path: <polyline points="18 15 12 9 6 15" />,
  },
  "caret-down": {
    iconName: "caret-down",
    path: <polyline points="6 9 12 15 18 9" />,
  },
  "caret-left": {
    iconName: "caret-left",
    path: <polyline points="15 18 9 12 15 6" />,
  },
  "caret-right": {
    iconName: "caret-right",
    path: <polyline points="9 18 15 12 9 6" />,
  },
} satisfies Record<string, IconDefintion>
