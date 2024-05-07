import { Dispatch } from "preact/hooks"

import { InputBorder, InputBorderProps } from "./InputBorder"
import { cn } from "../../utils/cn"
import { FocusHandlerProps } from "../base/BaseProps"
import { Dropdown } from "../dropdown/Dropdown"

interface SelectTriggerProps extends FocusHandlerProps {
  placeholder: string
  value?: string
}
const SelectTrigger = ({ placeholder, value }: SelectTriggerProps) => (
  <Dropdown.Trigger>
    <button
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

export interface SelectProps
  extends Pick<InputBorderProps, "label" | "alert">,
    FocusHandlerProps {
  value?: string
  options: Option[]
  placeholder?: string
  onChange?: Dispatch<string>
}

export const Select = ({
  options,
  value,
  placeholder = "Select one",
  onChange,
  onBlur,
  onFocus,
  ...labelProps
}: SelectProps) => {
  return (
    <InputBorder
      {...labelProps}
      className={
        "bgl-base-transparent hover:bgl-layer-w/5 focus-within:bgl-layer-w/5 active:bgl-layer-w/10 cursor-pointer"
      }
    >
      <Dropdown.Root
        placement="bottom-start"
        interactions={{ role: "listbox" }}
      >
        <SelectTrigger
          value={value}
          placeholder={placeholder}
          onBlur={onBlur}
          onFocus={onFocus}
        />
        <SelectDropdown options={options} onSelect={onChange} />
      </Dropdown.Root>
    </InputBorder>
  )
}
