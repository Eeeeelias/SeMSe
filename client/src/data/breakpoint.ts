import { createAtom } from "~/data/yaasl"

import { breakpoints } from "../../tailwind/breakpoints"

type BreakpointName = keyof typeof breakpoints

const getBreakpoint = () => {
  const { innerWidth } = window
  const match = Object.entries(breakpoints)
    .sort((a, b) => a[1] - b[1])
    .find(breakpoint => innerWidth < breakpoint[1]) ?? [
    "desktop",
    breakpoints.desktop,
  ]

  return {
    current: match[0] as BreakpointName,
    isMobile: innerWidth <= breakpoints.mobile,
    isTablet: innerWidth <= breakpoints.tablet,
    isLaptop: innerWidth <= breakpoints.laptop,
    isDesktop: true,
  }
}

export const breakpoint = createAtom({
  name: "breakpoint",
  defaultValue: getBreakpoint(),
})

window.addEventListener("resize", () => {
  const prev = breakpoint.get()
  const current = getBreakpoint()
  if (current.current === prev.current) return
  breakpoint.set(getBreakpoint())
})
