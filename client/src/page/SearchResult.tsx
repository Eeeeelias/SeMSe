import { useState } from "preact/hooks"

import { Icon } from "~/components/base/Icon"
import { Button } from "~/components/Button"
import { Card } from "~/components/Card"
import { Modal } from "~/components/Modal"
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
  onOpen,
  title,
  episodeId,
  episodeTitle,
  exactMatch,
  imageId,
  progress,
  text,
  timestamp,
  type,
}: QueryResult[number] & { onOpen: () => void }) => {
  const [timeStart, timeEnd] = progress ?? [undefined, undefined]
  return (
    <Card.Root className="relative">
      <Button onClick={onOpen} className="absolute right-1 top-1 z-10">
        <Icon icon="info" />
      </Button>

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

const InfoModal = ({
  episodeId,
  episodeTitle,
  imageId,
  title,
  text,
}: QueryResult[number]) => {
  const imageUrl = getImage(imageId)
  return (
    <>
      <div
        className="text-text-priority relative h-32 w-full overflow-hidden rounded-t-lg bg-cover"
        style={{
          backgroundImage: imageUrl ? `url(${imageUrl})` : undefined,
        }}
      >
        <h2 className="grid size-full place-content-center bg-black/60 p-2 text-center">
          <span className="truncate text-lg font-bold">{title}</span>
          <span className="text-text-highlight line-clamp-2 text-sm font-bold">
            {[episodeId, episodeTitle].filter(Boolean).join(" - ")}
          </span>
        </h2>
      </div>
      <div className="p-4">{text}</div>
    </>
  )
}

interface SearchResultProps {
  results: QueryResult
}

export const SearchResult = ({ results }: SearchResultProps) => {
  const [selected, setSelected] = useState<QueryResult[number] | null>(null)
  return (
    <>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(theme(width.60),1fr))] justify-center gap-4">
        {results.map(result => (
          <MatchCard
            key={getId(result)}
            {...result}
            onOpen={() => setSelected(result)}
          />
        ))}
      </div>

      {selected && (
        <Modal.Root onClose={() => setSelected(null)} className="w-96">
          <InfoModal {...selected} />
        </Modal.Root>
      )}
    </>
  )
}
