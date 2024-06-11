import { useAtomValue } from "@yaasl/preact"
import { useState } from "preact/hooks"

import { Icon } from "~/components/base/Icon"
import { Button } from "~/components/Button"
import { Card } from "~/components/Card"
import { Modal } from "~/components/Modal"
import { RangeMeter } from "~/components/RangeMeter"
import { breakpoint } from "~/data/breakpoint"
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

const Description = ({
  exactMatch,
  text = "",
}: Pick<QueryResult[number], "exactMatch" | "text">) => {
  const [trailing, leading] = !exactMatch ? [text] : text.split(exactMatch)
  if (!leading || !exactMatch) return <>{text}</>

  return (
    <>
      <span className="text-text-gentle">{trailing}</span>
      <span className="text-text-highlight">{exactMatch}</span>
      <span className="text-text-gentle">{leading}</span>
    </>
  )
}

const MatchDetails = ({
  timestamp,
  progress,
  type,
}: Pick<QueryResult[number], "timestamp" | "progress" | "type">) => {
  if (type === "description")
    return <span className="text-sm">Episode description</span>

  const [timeStart, timeEnd] = (timestamp?.split("-") ?? []).map(
    time => time.split(",")[0]
  )
  if (!timestamp) return null

  return (
    <div className="flex flex-col gap-1 pt-1">
      <span className="text-sm">Conversation</span>
      {progress && <RangeMeter start={progress[0]} end={progress[1]} />}
      <span className="text-sm">
        {timeStart} - {timeEnd}
      </span>
    </div>
  )
}

const ModalImage = ({ imageId }: Pick<QueryResult[number], "imageId">) => {
  const imageUrl = getImage(imageId)
  const backgroundImage = imageUrl ? `url(${imageUrl})` : undefined

  const { isMobile } = useAtomValue(breakpoint)
  if (isMobile)
    return (
      <div className="relative flex h-32 w-full overflow-hidden rounded-t-lg">
        <div
          className="h-full flex-1 bg-cover blur-md"
          style={{ backgroundImage }}
        />
        <div
          className="h-full flex-1 bg-cover blur-md"
          style={{ backgroundImage }}
        />
        <div className="absolute inset-0 size-full bg-black/25" />
        <div
          className="absolute left-1/2 h-full w-60 -translate-x-1/2 bg-cover"
          style={{ backgroundImage }}
        />
      </div>
    )

  return (
    <div
      className="h-32 w-60 shrink-0 rounded-br-lg rounded-tl-lg bg-cover"
      style={{ backgroundImage }}
    />
  )
}

const InfoModal = ({
  episodeId,
  episodeTitle,
  imageId,
  title,
  text,
  exactMatch,
  progress,
  timestamp,
  type,
}: QueryResult[number]) => {
  return (
    <div className="w-[calc(100vw-3rem)] max-w-prose">
      <div className="mobile:flex-col flex">
        <ModalImage imageId={imageId} />
        <div className="flex-1 px-4 pt-2">
          <h2 className="mr-10 text-lg font-bold">{title}</h2>
          <span className="text-text-gentle text-sm font-bold">
            {[episodeId, episodeTitle].filter(Boolean).join(" - ")}
          </span>
          <div className="pt-1" />
          <MatchDetails type={type} timestamp={timestamp} progress={progress} />
        </div>
      </div>
      <div className="max-h-96 overflow-auto p-4">
        <Description exactMatch={exactMatch} text={text} />
      </div>
    </div>
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
        <Modal.Root onClose={() => setSelected(null)} className="w-max">
          <InfoModal {...selected} />
        </Modal.Root>
      )}
    </>
  )
}
