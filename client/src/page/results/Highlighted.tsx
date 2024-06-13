interface HighlightedProps {
  text?: string
  highlight?: string
}

export const Highlighted = ({ highlight, text = "" }: HighlightedProps) => {
  if (!highlight) return <>{text}</>
  const [leading, ...matches] = text.split(new RegExp(highlight, "i"))
  if (matches.length === 0) return <>{text}</>

  return (
    <>
      <span className="text-text-gentle">{leading}</span>
      {matches.map(content => (
        <>
          <span className="text-text-highlight">{highlight}</span>
          <span className="text-text-gentle">{content}</span>
        </>
      ))}
    </>
  )
}
