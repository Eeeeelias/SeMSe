export const formatTimeStamp = (timestamp: string) => {
  const [start, end] = timestamp.split(" - ").map(time => time.split(",")[0])
  return `${start} - ${end}`
}
