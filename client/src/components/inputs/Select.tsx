import { useAtomValue } from "@yaasl/preact"
import { Dispatch, useState } from "preact/hooks"

import { breakpoint } from "~/data/breakpoint"
import { useVirtual } from "~/hooks/useVirtual"
import { cn } from "~/utils/cn"
import { vstack } from "~/utils/styles"

import { Action, AlertProps, Decorator } from "./Decorator"
import { TextField } from "./TextField"
import { FocusHandlerProps } from "../base/BaseProps"
import { Icon } from "../base/Icon"
import { Portal } from "../base/Portal"
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
          "-ml-3 inline-flex h-full min-w-[5ch] items-center pl-3 text-start outline-none",
          !value ? "text-text-gentle/50" : "text-text-priority"
        )}
      >
        <span className="inline-block max-w-[20ch] truncate">
          {/* eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing */}
          {label || placeholder}
        </span>
        {open ? (
          <Icon icon="caret-down" className="text-text ml-2 mt-1" />
        ) : (
          <Icon icon="caret-up" className="text-text ml-2" />
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

const PlainOptions = ({
  options,
  onSelect,
}: {
  options: Option[]
  onSelect?: Dispatch<string>
}) =>
  options.length === 0 ? (
    <span className="text-text-gentle mx-3">No options</span>
  ) : (
    <>
      {options.map(({ label, value }) => (
        <Dropdown.Close key={value}>
          <Dropdown.MenuItem
            className="block text-start"
            onClick={() => onSelect?.(value)}
          >
            {label}
          </Dropdown.MenuItem>
        </Dropdown.Close>
      ))}
    </>
  )

const SearchableOptions = ({
  options,
  onSelect,
}: {
  options: Option[]
  onSelect?: Dispatch<string>
}) => {
  const [filter, setFilter] = useState<string>()
  const displayedOptions = useOptions({ options, filter })
  const [scrollElement, setScrollElement] = useState<HTMLDivElement | null>(
    null
  )
  const { items, totalSize } = useVirtual({
    count: displayedOptions.length,
    estimateSize: () => 40,
    getScrollElement: () => scrollElement,
    overscan: 10,
  })

  const menuItems =
    displayedOptions.length === 0 ? (
      <span className="text-text-gentle mx-3">No options</span>
    ) : (
      items.map(({ key, index, offsetTop }) => {
        const { label, value } = displayedOptions[index]
        return (
          <Dropdown.Close key={key}>
            <Dropdown.MenuItem
              key={key}
              onClick={() => onSelect?.(value)}
              className="absolute"
              style={{ top: offsetTop }}
            >
              {label}
            </Dropdown.MenuItem>
          </Dropdown.Close>
        )
      })
    )

  return (
    <>
      <div className="border-stroke-gentle/50 w-60 border-b p-2">
        <TextField
          placeholder="Search options"
          className="border-text-gentle focus:border-stroke-highlight h-10 w-full min-w-full rounded border px-3"
          value={filter}
          onChange={setFilter}
        />
      </div>
      <div
        ref={setScrollElement}
        className={cn(
          vstack({ align: "stretch" }),
          "max-h-64 w-60 overflow-y-auto overflow-x-hidden p-2"
        )}
      >
        <div
          className="relative"
          style={{ minHeight: totalSize, height: totalSize }}
        >
          {menuItems}
        </div>
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

  const { isMobile } = useAtomValue(breakpoint)

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
          {isMobile && open && (
            <Portal>
              <div className="fixed inset-0 z-10 size-full bg-black/25 backdrop-blur" />
            </Portal>
          )}
          <Dropdown.Menu
            style={isMobile ? { transform: "" } : undefined}
            className={cn(
              isMobile &&
                "fixed inset-0 z-20 m-auto size-max items-center justify-center"
            )}
          >
            {searchable ? (
              <SearchableOptions options={options} onSelect={onChange} />
            ) : (
              <PlainOptions options={options} onSelect={onChange} />
            )}
          </Dropdown.Menu>
        </Dropdown.Root>
      </Decorator.Label>
    </Decorator.Border>
  )
}
