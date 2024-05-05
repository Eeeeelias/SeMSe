import { forwardRef } from "preact/compat"
import { Dispatch, useMemo, useState } from "preact/hooks"

import { InputBorder, InputBorderProps } from "./InputBorder"
import { cn } from "../../utils/cn"
import { meassureText } from "../../utils/meassureText"
import { useMergeRefs } from "../../utils/mergeRefs"
import { ClassNameProp } from "../base/BaseProps"

interface TextInputProps
  extends Pick<InputBorderProps, "label" | "alert">,
    ClassNameProp {
  value?: string
  placeholder?: string
  onChange?: Dispatch<string>
  onBlur?: () => void
  onFocus?: () => void
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  (
    { className, value, placeholder = "", onChange, ...labelProps },
    externalRef
  ) => {
    const [text, setText] = useState(value ?? "")
    const [internalRef, setInternalRef] = useState<HTMLInputElement | null>(
      null
    )
    const ref = useMergeRefs([setInternalRef, externalRef])

    const width = useMemo(() => {
      if (!internalRef) return
      const placeholderWidth = meassureText(placeholder, internalRef).width
      const valueWidth = meassureText(text, internalRef).width
      return Math.max(placeholderWidth, valueWidth)
    }, [placeholder, text, internalRef])

    return (
      <InputBorder {...labelProps} className="cursor-text">
        <input
          ref={ref}
          type="text"
          className={cn(
            "text-text-priority placeholder:text-text-gentle/75 h-full min-w-[5ch] max-w-[30ch] rounded bg-transparent outline-none",
            className
          )}
          value={value}
          placeholder={placeholder}
          onInput={({ currentTarget }) => {
            setText(currentTarget.value)
            onChange?.(currentTarget.value)
          }}
          style={{ width }}
        />
      </InputBorder>
    )
  }
)
