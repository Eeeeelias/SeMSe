import { Dispatch, useState } from "preact/hooks"

import { cn } from "~/utils/cn"

import { Action, AlertProps, Decorator } from "./Decorator"
import { FocusHandlerProps } from "../base/BaseProps"
import { Icon } from "../base/Icon"
import { Dropdown } from "../dropdown/Dropdown"

interface SelectTriggerProps extends FocusHandlerProps {
  placeholder: string
  value?: string
  open?: boolean
}
const SelectTrigger = ({
  placeholder,
  value,
  open,
  ...delegated
}: SelectTriggerProps) => (
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
      {value || placeholder}
      {open ? (
        <Icon icon="caret-down" className="text-text ml-2" />
      ) : (
        <Icon icon="caret-up" className="text-text mb-1 ml-2" />
      )}
    </button>
  </Dropdown.Trigger>
)

interface Option {
  value: string
  label: string
}

const SelectDropdown = ({
  options,
  onSelect,
}: {
  options: Option[]
  onSelect?: Dispatch<string>
}) => (
  <Dropdown.Close>
    <Dropdown.Menu>
      {options.map(({ value, label }) => (
        <Dropdown.MenuItem key={value} onClick={() => onSelect?.(label)}>
          {label}
        </Dropdown.MenuItem>
      ))}
    </Dropdown.Menu>
  </Dropdown.Close>
)

export interface SelectProps extends FocusHandlerProps {
  value?: string
  options: Option[]
  placeholder?: string
  onChange?: Dispatch<string>
  label: string
  alert?: AlertProps
  action?: Action
}

export const Select = ({
  options,
  placeholder = "Select one",
  onChange,
  action,
  alert,
  label,
  ...delegated
}: SelectProps) => {
  const [open, setOpen] = useState(false)
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
          <SelectTrigger {...delegated} open={open} placeholder={placeholder} />
          <SelectDropdown options={options} onSelect={onChange} />
        </Dropdown.Root>
      </Decorator.Label>
    </Decorator.Border>
  )
}
