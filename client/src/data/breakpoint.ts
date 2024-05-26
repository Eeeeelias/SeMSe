import { createAtom } from "@yaasl/preact"

const BREAKPOINTS = {
  mobile: 550,
  tablet: 1100,
  laptop: 1500,
  desktop: 9999,
}

type BreakpointName = keyof typeof BREAKPOINTS

const getBreakpoint = () => {
  const { innerWidth } = window
  const match = Object.entries(BREAKPOINTS)
    .sort((a, b) => a[1] - b[1])
    .find(breakpoint => innerWidth < breakpoint[1]) ?? [
    "desktop",
    BREAKPOINTS.desktop,
  ]

  /*
  return {
    name: match[0] as BreakpointName,
    value: match[1],
  }
  */

  return {
    current: match[0] as BreakpointName,
    isMobile: innerWidth <= BREAKPOINTS.mobile,
    isTablet: innerWidth <= BREAKPOINTS.tablet,
    isLaptop: innerWidth <= BREAKPOINTS.laptop,
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
