import { useEffect, useRef, useState } from "preact/hooks"

interface ScrollOptions {
  scrollElement: HTMLElement | null
}

export const useScroll = ({ scrollElement }: ScrollOptions) => {
  const [scrollTop, setScrollTop] = useState(scrollElement?.scrollTop ?? 0)
  const unsub = useRef<() => void>(() => null)

  useEffect(() => {
    unsub.current()
    const onScrollHandler = () => {
      setScrollTop(scrollElement?.scrollTop ?? 0)
    }
    scrollElement?.addEventListener("scroll", onScrollHandler)
    unsub.current = () =>
      scrollElement?.removeEventListener("scroll", onScrollHandler)

    return () => unsub.current()
  }, [scrollElement])

  return { scrollTop }
}
