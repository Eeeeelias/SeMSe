export const createRange = (start: number, end: number) =>
  Array.from({ length: end - start }, (_, i) => i + start)
