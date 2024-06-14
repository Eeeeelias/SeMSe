import { createSelector } from "~/data/yaasl"

import { windowSize } from "./windowSize"
import { breakpoints } from "../../tailwind/breakpoints"

type BreakpointName = keyof typeof breakpoints

export const breakpoint = createSelector([windowSize], size => {
  const { width } = size.px
  const match = Object.entries(breakpoints)
    .sort((a, b) => a[1] - b[1])
    .find(breakpoint => width < breakpoint[1]) ?? [
    "desktop",
    breakpoints.desktop,
  ]

  return {
    current: match[0] as BreakpointName,
    isMobile: width <= breakpoints.mobile,
    isTablet: width <= breakpoints.tablet,
    isLaptop: width <= breakpoints.laptop,
    isDesktop: true,
  }
})
