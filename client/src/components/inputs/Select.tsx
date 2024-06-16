import { Dispatch, useState } from "preact/hooks"

import { cn } from "~/utils/cn"
import { vstack } from "~/utils/styles"

import { Action, AlertProps, Decorator } from "./Decorator"
import { TextField } from "./TextField"
import { FocusHandlerProps } from "../base/BaseProps"
import { Icon } from "../base/Icon"
import { Dropdown } from "../dropdown/Dropdown"

interface Option {
  value: string
  label: string
}

interface SelectTriggerProps extends FocusHandlerProps {
  placeholder: string
  open?: boolean
  currentOption?: Option
}
const SelectTrigger = ({
  placeholder,
  currentOption,
  open,
  ...delegated
}: SelectTriggerProps) => {
  const { label, value } = currentOption ?? {}
  return (
    <Dropdown.Trigger>
      <button
        {...delegated}
        kind="flat"
        className={cn(
          "-ml-3 h-full min-w-[5ch] pl-3 text-start outline-none",
          !value ? "text-text-gentle/50" : "text-text-priority"
        )}
      >
        {/* eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing */}
        {label || placeholder}
        {open ? (
          <Icon icon="caret-down" className="text-text ml-2" />
        ) : (
          <Icon icon="caret-up" className="text-text mb-1 ml-2" />
        )}
      </button>
    </Dropdown.Trigger>
  )
}

const normalize = (value: string) =>
  value.toLowerCase().replace(/[^A-Za-z0-9]*/gi, "")
const isSimilar = (valueA: string, valueB: string) =>
  normalize(valueA).includes(normalize(valueB)) ||
  normalize(valueB).includes(normalize(valueA))

const useOptions = ({
  options,
  filter,
}: {
  options: Option[]
  filter?: string
}) => {
  const filtered =
    filter == null
      ? options
      : options.filter(({ label }) => isSimilar(label, filter))

  return filtered.sort((a, b) => a.label.localeCompare(b.label))
}

const SelectOptions = ({
  options,
  onSelect,
  searchable,
}: {
  options: Option[]
  onSelect?: Dispatch<string>
  searchable?: boolean
}) => {
  const [filter, setFilter] = useState<string>()

  const displayedOptions = useOptions({ options, filter })
  const menuItems =
    displayedOptions.length === 0 ? (
      <span className="text-text-gentle mx-3">No options</span>
    ) : (
      displayedOptions.map(({ value, label }) => (
        <Dropdown.Close key={value}>
          <Dropdown.MenuItem
            onClick={() => {
              setFilter("")
              onSelect?.(value)
            }}
          >
            {label}
          </Dropdown.MenuItem>
        </Dropdown.Close>
      ))
    )

  if (!searchable) {
    return <>{menuItems}</>
  }

  return (
    <>
      <div className="border-stroke-gentle/50 w-full border-b p-2">
        <TextField
          placeholder="Search options"
          className="border-text-gentle focus:border-stroke-highlight h-10 w-full min-w-full rounded border px-3"
          value={filter}
          onChange={setFilter}
        />
      </div>
      <div
        className={cn(
          vstack({ align: "stretch" }),
          "max-h-64 max-w-64 overflow-auto p-2"
        )}
      >
        {menuItems}
      </div>
    </>
  )
}

export interface SelectProps extends FocusHandlerProps {
  value?: string
  options: Option[]
  placeholder?: string
  onChange?: Dispatch<string>
  label: string
  alert?: AlertProps
  action?: Action
  searchable?: boolean
}

export const Select = ({
  options,
  placeholder = "Select one",
  onChange,
  action,
  alert,
  label,
  searchable,
  value,
  ...delegated
}: SelectProps) => {
  const [open, setOpen] = useState(false)
  const currentOption = options.find(option => option.value === value)

  return (
    <Decorator.Border action={action} alert={alert}>
      <Decorator.Label
        label={label}
        alert={alert}
        className="bgl-base-transparent hover:bgl-layer-w/5 focus-within:bgl-layer-w/5 active:bgl-layer-w/10"
      >
        <Dropdown.Root
          placement="bottom-start"
          interactions={{ role: "listbox" }}
          open={open}
          onOpenChange={setOpen}
        >
          <SelectTrigger
            {...delegated}
            currentOption={currentOption}
            open={open}
            placeholder={placeholder}
          />
          <Dropdown.Menu>
            <SelectOptions
              options={options}
              onSelect={onChange}
              searchable={searchable}
            />
          </Dropdown.Menu>
        </Dropdown.Root>
      </Decorator.Label>
    </Decorator.Border>
  )
}
