import { createRange } from "~/utils/createRange"

import { useScroll } from "./useScroll"

interface VirtualOptions {
  count: number
  estimateSize: () => number
  getScrollElement: () => HTMLElement | null
  overscan?: number
  getItemKey?: (index: number) => string
}

interface VirtualItem {
  key: string
  index: number
  offsetTop: number
}

interface VirtualResult {
  totalSize: number
  items: VirtualItem[]
}

const calculateTotalSize = ({
  count,
  estimateSize,
}: Pick<VirtualOptions, "count" | "estimateSize">) => {
  const itemSize = estimateSize()
  return count * itemSize - 1
}

const getFirstVisibleIndex = ({
  scrollTop,
  estimateSize,
}: Pick<VirtualOptions, "estimateSize"> & { scrollTop: number }) => {
  const itemSize = estimateSize()

  return Math.floor(scrollTop / itemSize)
}

const getAmountOfVisibleItems = ({
  estimateSize,
  getScrollElement,
}: Pick<VirtualOptions, "estimateSize" | "getScrollElement">) => {
  const height = getScrollElement()?.clientHeight ?? 0
  const itemSize = estimateSize()

  return Math.floor(height / itemSize) + 1
}

export const useVirtual = ({
  getScrollElement,
  count,
  estimateSize,
  getItemKey = String,
  overscan = 0,
}: VirtualOptions): VirtualResult => {
  const { scrollTop } = useScroll({
    scrollElement: getScrollElement(),
  })

  const startIndex = getFirstVisibleIndex({ scrollTop, estimateSize })
  const amount = getAmountOfVisibleItems({
    estimateSize,
    getScrollElement,
  })
  const endIndex = startIndex + amount

  const visibleItems = createRange(
    Math.max(0, startIndex - overscan),
    Math.min(count, endIndex + overscan)
  ).map<VirtualItem>(index => ({
    index,
    key: getItemKey(index),
    offsetTop: index * estimateSize(),
  }))

  return {
    items: visibleItems,
    totalSize: calculateTotalSize({ count, estimateSize }),
  }
}
