import { useAtomValue } from "@yaasl/preact"
import { Dispatch, useEffect, useRef, useState } from "preact/hooks"

import { sizeAtom } from "~/data/size"
import { cn } from "~/utils/cn"

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

interface KpiProps {
  id: string
  label: string
  value: number
}

const NumberKpi = ({ label, value }: KpiProps) => {
  const { ref, count } = useCountUp(value)
  return (
    <div className={cn("flex flex-col items-start justify-center")}>
      <span ref={ref} className="font-mono text-xl">
        {count}
      </span>
      <span className="text-text/75 text-sm font-bold">{label}</span>
    </div>
  )
}

const labels: Record<string, string> = {
  tv_shows: "TV Shows",
  animes: "Animes",
  movies: "Movies",
  descriptions: "Descriptions",
  subtitles: "Subtitles",
}

const getKpis = (size: Record<string, number>) =>
  Object.entries(size).reduce<KpiProps[]>(
    (acc, [key, value]) => [...acc, { id: key, value, label: labels[key] }],
    []
  )

export const SizeKpis = () => {
  const size = useAtomValue(sizeAtom)

  return !size ? null : (
    <div
      className={cn(
        "m-4 mx-auto flex max-w-3xl flex-wrap justify-center gap-10 bg-transparent px-4 py-2"
      )}
    >
      {getKpis(size).map(kpi => (
        <NumberKpi key={kpi.id} {...kpi} />
      ))}
    </div>
  )
}
