import { useState, Dispatch } from "preact/hooks"

import { Icon } from "~/components/base/Icon"
import { QueryResult } from "~/generated-api"

import { MatchCard } from "./MatchCard"

const getId = (result: QueryResult[number]) =>
  (result.title ?? "") + (result.episodeId ?? "") + (result.timestamp ?? "")

interface MatchListProps {
  title: string
  highlight?: string
  matches: QueryResult
  onOpenDetails: Dispatch<QueryResult[number]>
}

export const ResultList = ({
  title,
  highlight,
  matches,
  onOpenDetails,
}: MatchListProps) => {
  const expandable = matches.length > 4
  const [expanded, setExpanded] = useState(false)
  const displayedMatches = expanded ? matches : matches.slice(0, 4)

  const headline = (
    <h2 className="text-xl font-bold">
      {title}
      <span className="text-text-gentle ml-4 text-sm">
        {matches.length} matches
      </span>
    </h2>
  )
  return (
    <>
      {expandable ? (
        <button
          onClick={() => setExpanded(state => !state)}
          className="bgl-base-transparent hover:bgl-layer-w/5 focus-visible:bgl-layer-w/5 active:bgl-layer-w/10 mb-2 mt-6 flex items-center gap-2 rounded px-3 py-2"
        >
          <Icon icon={expanded ? "caret-down" : "caret-right"} />
          {headline}
        </button>
      ) : (
        <div className="mb-4 mt-8">{headline}</div>
      )}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(theme(width.60),1fr))] justify-center gap-4">
        {displayedMatches.map(result => (
          <MatchCard
            key={getId(result)}
            {...result}
            highlight={highlight}
            onOpenDetails={() => onOpenDetails(result)}
          />
        ))}
      </div>
    </>
  )
}
