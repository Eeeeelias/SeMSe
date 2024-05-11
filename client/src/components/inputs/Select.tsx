import { Dispatch } from "preact/hooks"

import { cn } from "~/utils/cn"

import { Action, AlertProps, Decorator } from "./Decorator"
import { FocusHandlerProps } from "../base/BaseProps"
import { Dropdown } from "../dropdown/Dropdown"

interface SelectTriggerProps extends FocusHandlerProps {
  placeholder: string
  value?: string
}
const SelectTrigger = ({
  placeholder,
  value,
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
        >
          <SelectTrigger {...delegated} placeholder={placeholder} />
          <SelectDropdown options={options} onSelect={onChange} />
        </Dropdown.Root>
      </Decorator.Label>
    </Decorator.Border>
  )
}
