import { Dispatch } from "preact/hooks"

import { Icon } from "~/components/base/Icon"
import { Button } from "~/components/Button"
import { Card } from "~/components/Card"
import { RangeMeter } from "~/components/RangeMeter"
import { QueryResult } from "~/generated-api"

import { formatTimeStamp } from "./utils/formatTimeStamp"
import { getImageUrl } from "./utils/getImageUrl"

const getId = (result: QueryResult[number]) =>
  (result.title ?? "") + (result.episodeId ?? "") + (result.timestamp ?? "")

const MatchCard = ({
  onOpenDetails,
  title,
  episodeId,
  episodeTitle,
  exactMatch,
  imageId,
  progress,
  text,
  timestamp,
  type,
}: QueryResult[number] & { onOpenDetails: () => void }) => {
  const [timeStart, timeEnd] = progress ?? [undefined, undefined]
  return (
    <Card.Root className="relative">
      <Button onClick={onOpenDetails} className="absolute right-1 top-1 z-10">
        <Icon icon="info" />
      </Button>

      <Card.Hero
        title={title ?? ""}
        subtitle={[episodeId, episodeTitle].filter(Boolean).join(" - ")}
        imageUrl={getImageUrl(imageId)}
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

interface MatchListProps {
  results: QueryResult
  onOpenDetails: Dispatch<QueryResult[number]>
}

export const ResultList = ({ results, onOpenDetails }: MatchListProps) => (
  <div className="grid grid-cols-[repeat(auto-fit,minmax(theme(width.60),1fr))] justify-center gap-4">
    {results.map(result => (
      <MatchCard
        key={getId(result)}
        {...result}
        onOpenDetails={() => onOpenDetails(result)}
      />
    ))}
  </div>
)
