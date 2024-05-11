import { useAtomValue } from "@yaasl/preact"
import { Dispatch, useEffect, useRef, useState } from "preact/hooks"

import { sizeAtom } from "~/data/size"
import { cn } from "~/utils/cn"
import { surface } from "~/utils/styles"

const getSteps = (value: number) =>
  value < 250
    ? {
        step: 1,
        intervalMs: 250 / value,
      }
    : {
        step: value / 250,
        intervalMs: 1,
      }

const numberToText = (value: number) => Math.floor(value).toLocaleString()

const countUp = (
  element: HTMLElement,
  value: number,
  onEnd: Dispatch<string>
) => {
  let count = 0
  const { step, intervalMs } = getSteps(value)

  const interval = setInterval(() => {
    if (count >= value) {
      element.textContent = ""
      onEnd(numberToText(count))
      clearInterval(interval)
      return
    }
    count += step
    element.textContent = numberToText(count)
  }, intervalMs)

  return () => clearInterval(interval)
}

const useCountUp = (value: number) => {
  const [count, setCount] = useState("0")
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return
    const cleanup = countUp(element, value, value => setCount(value))
    return () => cleanup()
  }, [value])

  return { ref, count }
}

interface NumberKpiProps {
  title: string
  value: number
}
const NumberKpi = ({ title, value }: NumberKpiProps) => {
  const { ref, count } = useCountUp(value)
  return (
    <div className={cn("flex flex-col items-center")}>
      <b ref={ref}>{count}</b>
      <span>{title}</span>
    </div>
  )
}

export const SizeKpis = () => {
  const size = useAtomValue(sizeAtom)

  return !size ? null : (
    <div
      className={cn(
        surface(),
        "m-4 mx-auto flex w-max flex-wrap justify-center gap-4 px-4 py-2"
      )}
    >
      {Object.entries(size).map(([key, value]) => (
        <NumberKpi key={key} title={key} value={value} />
      ))}
    </div>
  )
}
