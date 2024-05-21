import { Card } from "~/components/Card"
import { QueryResult } from "~/generated-api"

const getId = (result: QueryResult[number]) =>
  (result.title ?? "") + (result.episodeId ?? "") + (result.timestamp ?? "")

const getImage = (result: QueryResult[number]) =>
  result.imageId ? `https://semse.rhostruct.de/image/${result.imageId}` : ""

const formatTimeStamp = (timestamp: string) => {
  const [start, end] = timestamp.split(" - ").map(time => time.split(",")[0])
  return `${start} - ${end}`
}

interface SearchResultProps {
  results: QueryResult
}

export const SearchResult = ({ results }: SearchResultProps) => (
  <div className="grid grid-cols-[repeat(auto-fit,minmax(theme(width.60),1fr))] justify-center gap-4">
    {results.map(result => (
      <Card.Root key={getId(result)}>
        <Card.Hero
          title={result.title ?? ""}
          subtitle={[result.episodeId, result.episodeTitle]
            .filter(Boolean)
            .join(" - ")}
          imageUrl={getImage(result)}
        />
        <Card.Note>
          {result.timestamp
            ? formatTimeStamp(result.timestamp)
            : "Episode description"}
        </Card.Note>

        {result.type === "description" ? (
          <Card.Text>{result.text}</Card.Text>
        ) : (
          <Card.Quote>{result.text}</Card.Quote>
        )}
      </Card.Root>
    ))}
  </div>
)
