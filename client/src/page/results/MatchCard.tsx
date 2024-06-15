import { Icon } from "~/components/base/Icon"
import { Button } from "~/components/Button"
import { Card } from "~/components/Card"
import { RangeMeter } from "~/components/RangeMeter"
import { QueryResult } from "~/generated-api"

import { Highlighted } from "./Highlighted"
import { formatTimeStamp } from "./utils/formatTimeStamp"
import { getImageUrl } from "./utils/getImageUrl"

type MatchCardProps = QueryResult[number] & {
  highlight?: string
  onOpenDetails: () => void
}

export const MatchCard = ({
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
  highlight,
}: MatchCardProps) => {
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
        <Card.Text>
          <Highlighted text={text} highlight={highlight} />
        </Card.Text>
      ) : (
        <Card.Quote>
          <Highlighted text={exactMatch || text} highlight={highlight} />
        </Card.Quote>
      )}
    </Card.Root>
  )
}
