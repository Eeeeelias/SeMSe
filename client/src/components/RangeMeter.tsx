interface RangeMeterProps {
  start: number
  end: number
}
export const RangeMeter = ({ start, end }: RangeMeterProps) => {
  return (
    <div
      className={"bg-text/25 relative h-1 w-full rounded-full backdrop-blur"}
    >
      <div
        className="bg-background-highlight absolute inset-0 h-full rounded-full"
        style={{ left: `${start}%`, right: `${100 - end}%` }}
      />
    </div>
  )
}
