import { forwardRef } from "preact/compat"
import { Dispatch, useMemo, useState } from "preact/hooks"

import { breakpoint } from "~/data/breakpoint"
import { useAtomValue } from "~/data/yaasl"
import { cn } from "~/utils/cn"
import { meassureText } from "~/utils/meassureText"
import { useMergeRefs } from "~/utils/mergeRefs"

import { ClassNameProp, FocusHandlerProps } from "../base/BaseProps"

export interface TextFieldProps extends FocusHandlerProps, ClassNameProp {
  value?: string
  placeholder?: string
  onChange?: Dispatch<string>
  isValid?: (value: string) => boolean
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  (
    { className, value, placeholder = "", onChange, onBlur, onFocus, isValid },
    externalRef
  ) => {
    const { isMobile } = useAtomValue(breakpoint)
    const [text, setText] = useState(value ?? "")
    const [internalRef, setInternalRef] = useState<HTMLInputElement | null>(
      null
    )
    const ref = useMergeRefs([setInternalRef, externalRef])

    const width = useMemo(() => {
      if (!internalRef || isMobile) return
      const placeholderWidth = meassureText(placeholder, internalRef).width
      const valueWidth = meassureText(text, internalRef).width
      return Math.max(placeholderWidth, valueWidth)
    }, [placeholder, text, internalRef, isMobile])

    //useEffect(() => {
    //  if (!internalRef || internalRef.value === value) return
    //  internalRef.value = value ?? ""
    //}, [internalRef, value])

    return (
      <input
        ref={ref}
        type="text"
        className={cn(
          "text-text-priority placeholder:text-text-gentle/50 size-full min-w-[5ch] max-w-[30ch] rounded bg-transparent outline-none",
          className
        )}
        value={text}
        placeholder={placeholder}
        onInput={event => {
          const value = event.currentTarget.value
          if (isValid && !isValid(value)) {
            event.currentTarget.value = text
            return
          }

          setText(value)
          onChange?.(value)
        }}
        onBlur={onBlur}
        onFocus={onFocus}
        style={{ width }}
      />
    )
  }
)
