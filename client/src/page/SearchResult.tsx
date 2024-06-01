import { Card } from "~/components/Card"
import { RangeMeter } from "~/components/RangeMeter"
import { OpenAPI, QueryResult } from "~/generated-api"

const getId = (result: QueryResult[number]) =>
  (result.title ?? "") + (result.episodeId ?? "") + (result.timestamp ?? "")

const getImage = (imageId?: string) =>
  imageId ? `${OpenAPI.BASE}/image/${imageId}` : ""

const formatTimeStamp = (timestamp: string) => {
  const [start, end] = timestamp.split(" - ").map(time => time.split(",")[0])
  return `${start} - ${end}`
}

const MatchCard = ({
  title,
  episodeId,
  episodeTitle,
  exactMatch,
  imageId,
  progress,
  text,
  timestamp,
  type,
}: QueryResult[number]) => {
  const [timeStart, timeEnd] = progress ?? [undefined, undefined]
  return (
    <Card.Root>
      <Card.Hero
        title={title ?? ""}
        subtitle={[episodeId, episodeTitle].filter(Boolean).join(" - ")}
        imageUrl={getImage(imageId)}
      >
        {timeStart != null && timeEnd != null && (
          <div className="absolute inset-x-4 bottom-4">
            <RangeMeter start={timeStart} end={timeEnd} />
          </div>
        )}
      </Card.Hero>
      <Card.Note>
        {timestamp ? formatTimeStamp(timestamp) : "Episode description"}
      </Card.Note>

      {type === "description" ? (
        <Card.Text>{text}</Card.Text>
      ) : (
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        <Card.Quote>{exactMatch || text}</Card.Quote>
      )}
    </Card.Root>
  )
}

interface SearchResultProps {
  results: QueryResult
}

export const SearchResult = ({ results }: SearchResultProps) => (
  <div className="grid grid-cols-[repeat(auto-fit,minmax(theme(width.60),1fr))] justify-center gap-4">
    {results.map(result => (
      <MatchCard key={getId(result)} {...result} />
    ))}
  </div>
)
