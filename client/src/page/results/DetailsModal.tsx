import { useAtomValue } from "@yaasl/preact"

import { Image } from "~/components/Image"
import { Modal } from "~/components/Modal"
import { Quote } from "~/components/Quote"
import { RangeMeter } from "~/components/RangeMeter"
import { breakpoint } from "~/data/breakpoint"
import { QueryResult } from "~/generated-api"

import { Highlighted } from "./Highlighted"
import { formatTimeStamp } from "./utils/formatTimeStamp"
import { getImageUrl } from "./utils/getImageUrl"

const MatchDetails = ({
  timestamp,
  progress,
  type,
}: Pick<QueryResult[number], "timestamp" | "progress" | "type">) => {
  if (type === "description")
    return <span className="text-sm">Episode description</span>

  if (!timestamp) return null

  return (
    <div className="flex flex-col gap-1 pt-1">
      <span className="text-sm">Conversation</span>
      {progress && <RangeMeter start={progress[0]} end={progress[1]} />}
      <span className="text-sm">{formatTimeStamp(timestamp)}</span>
    </div>
  )
}

const ModalImage = ({ imageId }: Pick<QueryResult[number], "imageId">) => {
  const imageUrl = getImageUrl(imageId)
  const { isMobile } = useAtomValue(breakpoint)

  return !isMobile ? (
    <Image
      src={imageUrl}
      fallback="./fallback.svg"
      className="h-32 w-60 shrink-0 rounded-br-lg rounded-tl-lg"
    />
  ) : (
    <div className="relative flex h-32 w-full overflow-hidden rounded-t-lg">
      <Image
        src={imageUrl}
        fallback="./fallback.svg"
        className="h-full flex-1 blur-md"
      />
      <Image
        src={imageUrl}
        fallback="./fallback.svg"
        className="h-full flex-1 blur-md"
      />
      <div className="absolute inset-0 size-full bg-black/25" />
      <Image
        src={imageUrl}
        fallback="./fallback.svg"
        className="absolute left-1/2 h-full w-60 -translate-x-1/2"
      />
    </div>
  )
}

interface DetailsModalProps {
  onClose: () => void
  selected: QueryResult[number]
  highlight: string
}
export const DetailsModal = ({
  highlight,
  selected,
  onClose,
}: DetailsModalProps) => {
  const {
    episodeId,
    episodeTitle,
    imageId,
    title,
    text,
    progress,
    timestamp,
    type,
  } = selected
  return (
    <Modal.Root onClose={onClose} className="w-max">
      <div className="w-[calc(100vw-3rem)] max-w-prose">
        <div className="mobile:flex-col flex">
          <ModalImage imageId={imageId} />
          <div className="flex-1 px-4 pt-2">
            <h2 className="mr-10 text-lg font-bold">{title}</h2>
            <span className="text-text-gentle text-sm font-bold">
              {[episodeId, episodeTitle].filter(Boolean).join(" - ")}
            </span>
            <div className="pt-1" />
            <MatchDetails
              type={type}
              timestamp={timestamp}
              progress={progress}
            />
          </div>
        </div>
        <div className="max-h-96 overflow-auto p-4">
          {type === "description" ? (
            <Highlighted text={text} highlight={highlight} />
          ) : (
            <Quote>
              <Highlighted text={text} highlight={highlight} />
            </Quote>
          )}
        </div>
      </div>
    </Modal.Root>
  )
}
