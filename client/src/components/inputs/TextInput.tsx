import { Dispatch, useMemo, useState } from "preact/hooks"

import { InputBorder, InputBorderProps } from "./InputBorder"
import { cn } from "../../utils/cn"
import { meassureText } from "../../utils/meassureText"
import { mergeRefs } from "../../utils/mergeRefs"
import { ClassNameProp, RefProp } from "../base/BaseProps"

interface TextInputProps
  extends Pick<InputBorderProps, "label">,
    ClassNameProp,
    RefProp<HTMLInputElement> {
  value?: string
  placeholder?: string
  onChange?: Dispatch<string>
}

export const TextInput = ({
  ref: externalRef,
  className,
  label,
  value,
  placeholder = "",
  onChange,
}: TextInputProps) => {
  const [ref, setRef] = useState<HTMLInputElement | null>(null)
  const [text, setText] = useState(value ?? "")

  const width = useMemo(() => {
    if (!ref) return
    const placeholderWidth = meassureText(placeholder, ref).width
    const valueWidth = meassureText(text, ref).width
    return Math.max(placeholderWidth, valueWidth)
  }, [placeholder, text, ref])

  return (
    <InputBorder label={label}>
      <input
        ref={mergeRefs(setRef, externalRef)}
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
