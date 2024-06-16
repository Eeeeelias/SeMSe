import { Dispatch, useState } from "preact/hooks"

import { cn } from "~/utils/cn"

import { Action, AlertProps, Decorator } from "./Decorator"
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
        <Dropdown.MenuItem key={value} onClick={() => onSelect?.(value)}>
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
          <SelectDropdown options={options} onSelect={onChange} />
        </Dropdown.Root>
      </Decorator.Label>
    </Decorator.Border>
  )
}
