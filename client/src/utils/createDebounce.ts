export const createDebounce = (delay: number) => {
  let timeout: NodeJS.Timeout
  return (fn: () => void) => {
    clearTimeout(timeout)
    timeout = setTimeout(fn, delay)
  }
}
