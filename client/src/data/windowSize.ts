import { createAtom } from "~/data/yaasl"
import { createDebounce } from "~/utils/createDebounce"

const pxToRem = (px: number) =>
  px / parseFloat(window.getComputedStyle(document.documentElement).fontSize)

const getSize = () => {
  const px = { width: window.innerWidth, height: window.innerHeight }
  const rem = { width: pxToRem(px.width), height: pxToRem(px.height) }
  return { px, rem }
}

export const windowSize = createAtom({
  name: "window-size",
  defaultValue: getSize(),
})

const debounce = createDebounce(25)

window.addEventListener("resize", () => {
  debounce(() => windowSize.set(getSize()))
})
