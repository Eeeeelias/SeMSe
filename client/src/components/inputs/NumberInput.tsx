import { forwardRef } from "preact/compat"
import { Dispatch } from "preact/hooks"

import { TextInput, TextInputProps } from "./TextInput"
import { ClassNameProp } from "../base/BaseProps"

interface NumberInputProps
  extends Omit<TextInputProps, "value" | "onChange" | "isValid">,
    ClassNameProp {
  value?: number | null
  onChange?: Dispatch<number | null>
  isValid?: (value: number) => boolean
  min?: number
  max?: number
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max)

export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  (
    { value, onChange, min = 0, max = 999, isValid, ...delegated },
    externalRef
  ) => {
    const handleChange = (value: string) => {
      if (value === "") {
        onChange?.(null)
        return
      }
      const number = parseInt(value)
      if (isNaN(number)) return
      onChange?.(clamp(number, min, max))
    }

    const validate = (value: string) => {
      if (value === "") return true
      if (/[^0-9]/.test(value)) return false
      if (value.length > String(max).length) return false
      const number = parseInt(value)
      return number >= min && number <= max && (!isValid || isValid(number))
    }

    return (
      <TextInput
        ref={externalRef}
        value={String(value ?? "")}
        isValid={validate}
        onChange={handleChange}
        {...delegated}
      />
    )
  }
)
