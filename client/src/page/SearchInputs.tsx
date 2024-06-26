import { createContext, JSX } from "preact"

import { useAtomValue } from "@yaasl/preact"
import { Dispatch, useContext, useMemo, useState } from "preact/hooks"

import { ChildrenProp } from "~/components/base/BaseProps"
import { Icon } from "~/components/base/Icon"
import { Button } from "~/components/Button"
import { Action } from "~/components/inputs/Decorator"
import { NumberInput } from "~/components/inputs/NumberInput"
import { Select } from "~/components/inputs/Select"
import { TextInput } from "~/components/inputs/TextInput"
import { MenuButton } from "~/components/MenuButton"
import { QueryRequestBody } from "~/data/api/fetchQuery"
import { mediaAtom } from "~/data/media"
import { Media } from "~/generated-api"
import { cn } from "~/utils/cn"
import { hstack, surface } from "~/utils/styles"

const Context = createContext<null | {
  filters: QueryRequestBody
  setFilter: <K extends keyof QueryRequestBody>(
    key: K
  ) => (value: QueryRequestBody[K]) => void
}>(null)

const useFilters = () => {
  const state = useContext(Context)
  if (!state) {
    throw new Error("useFilters must be used within a FilterProvider")
  }
  return state
}

const FilterProvider = ({ children }: ChildrenProp) => {
  const [filters, setFilters] = useState<QueryRequestBody>({
    query: "",
    table: "",
  })

  const setFilter =
    <K extends keyof QueryRequestBody>(key: K) =>
    (value: QueryRequestBody[K]) => {
      setFilters(prev => {
        if (value === undefined) {
          const { [key]: _, ...rest } = prev
          return rest as QueryRequestBody
        }
        return { ...prev, [key]: value }
      })
    }

  return (
    <Context.Provider value={{ filters, setFilter }}>
      {children}
    </Context.Provider>
  )
}

interface InputProps {
  label: string
  action?: Action
}

const QueryInput = (props: InputProps) => {
  const { filters, setFilter } = useFilters()
  return (
    <TextInput
      placeholder="Parkour!"
      value={filters.query}
      onChange={setFilter("query")}
      {...props}
    />
  )
}

const TableInput = (props: InputProps) => {
  const { filters, setFilter } = useFilters()
  return (
    <Select
      placeholder="Select one"
      value={filters.table}
      onChange={setFilter("table")}
      options={[
        { value: "Animes", label: "Animes" },
        { value: "Movies", label: "Movies" },
        { value: "TVShows", label: "TV Shows" },
      ]}
      {...props}
    />
  )
}

const TitleInput = (props: InputProps) => {
  const { filters, setFilter } = useFilters()
  const media = useAtomValue(mediaAtom)

  const options = useMemo(
    () =>
      media?.[filters.table as keyof Media]?.map(({ name }) => ({
        label: String(name),
        value: String(name),
      })) ?? [],
    [filters.table, media]
  )

  return (
    <Select
      key={filters.type}
      placeholder="The Office"
      value={filters.show}
      onChange={setFilter("show")}
      options={options}
      searchable
      {...props}
    />
  )
}

const LanguageInput = (props: InputProps) => {
  const { filters, setFilter } = useFilters()
  return (
    <TextInput
      placeholder="en-US"
      value={filters.language}
      onChange={setFilter("language")}
      {...props}
    />
  )
}

const TypeInput = (props: InputProps) => {
  const { filters, setFilter } = useFilters()
  return (
    <Select
      placeholder="Select one"
      value={filters.type}
      onChange={setFilter("type")}
      options={[
        { value: "both", label: "Both" },
        { value: "conversation", label: "Conversation" },
        { value: "description", label: "Description" },
      ]}
      {...props}
    />
  )
}

const SeasonInput = (props: InputProps) => {
  const { filters, setFilter } = useFilters()
  return (
    <NumberInput
      placeholder="42"
      max={99}
      value={parseInt(filters.season ?? "0")}
      onChange={value =>
        setFilter("season")(
          !value ? undefined : `S${value.toString().padStart(2, "0")}`
        )
      }
      {...props}
    />
  )
}

interface InputConfig {
  label: string
  value: string
  required?: boolean
  component: (props: InputProps) => JSX.Element
}

const inputs: Record<string, InputConfig> = {
  query: {
    label: "Query",
    value: "query",
    required: true,
    component: QueryInput,
  },
  table: {
    label: "Category",
    value: "table",
    required: true,
    component: TableInput,
  },
  show: {
    label: "Title",
    value: "show",
    component: TitleInput,
  },
  language: {
    label: "Language",
    value: "language",
    component: LanguageInput,
  },
  type: {
    label: "Type",
    value: "type",
    component: TypeInput,
  },
  season: {
    label: "Season",
    value: "season",
    component: SeasonInput,
  },
}

const getRequiredInputs = () =>
  Object.values(inputs).filter(({ required }) => required)

const SearchButton = ({ onSubmit }: SearchSubmitProp) => {
  const { filters } = useFilters()

  const isValid = getRequiredInputs().every(
    ({ value }) => !!filters[value as keyof QueryRequestBody]
  )

  return (
    <Button kind="key" disabled={!isValid} onClick={() => onSubmit(filters)}>
      <Icon icon="search" />
      Search
    </Button>
  )
}

export const FilterInputs = () => {
  const { setFilter } = useFilters()
  const [selected, setSelected] = useState<string[]>(
    getRequiredInputs().map(({ value }) => value)
  )

  const visibleInputs = selected.map(key => {
    const { component, ...rest } = inputs[key]
    return { key, ...rest, Component: component }
  })

  const hiddenInputs = Object.values(inputs)
    .filter(({ value }) => !selected.includes(value))
    .map(({ label, value }) => ({ label, value }))

  const addFilter = (value: string) => {
    setSelected(prev => [...prev, value])
  }
  const removeFilter = (value: string) => {
    setSelected(prev => prev.filter(v => v !== value))
    setFilter(value as keyof QueryRequestBody)(undefined)
  }

  return (
    <div className={cn(hstack({ gap: 2, justify: "start", wrap: true }))}>
      {visibleInputs.map(({ key, Component, required, value, label }) => (
        <Component
          key={key}
          label={label}
          action={
            required
              ? undefined
              : {
                  icon: "minus-circle",
                  onClick: () => removeFilter(value),
                }
          }
        />
      ))}

      {hiddenInputs.length > 0 && (
        <MenuButton
          kind="flat"
          size="icon"
          round
          items={hiddenInputs}
          onSelect={value => addFilter(value)}
        >
          <Icon icon="plus-circle" />
        </MenuButton>
      )}
    </div>
  )
}

interface SearchSubmitProp {
  onSubmit: Dispatch<QueryRequestBody>
}
export const SearchInputs = ({ onSubmit }: SearchSubmitProp) => (
  <FilterProvider>
    <div
      className={cn(
        surface({ rounded: "lg" }),
        hstack({ gap: 4 }),
        "mobile:flex-col mx-auto w-fit p-4"
      )}
    >
      <p className={"pt-2"}>Filters:</p>
      <FilterInputs />
      <SearchButton onSubmit={onSubmit} />
    </div>
  </FilterProvider>
)
