import { useAtomValue } from "@yaasl/preact"
import { forwardRef } from "preact/compat"
import { Dispatch, useMemo, useState } from "preact/hooks"

import { Decorator, AlertProps, Action } from "./Decorator"
import { breakpoint } from "../../data/breakpoint"
import { cn } from "../../utils/cn"
import { meassureText } from "../../utils/meassureText"
import { useMergeRefs } from "../../utils/mergeRefs"
import { ClassNameProp, FocusHandlerProps } from "../base/BaseProps"

export interface TextInputProps extends FocusHandlerProps, ClassNameProp {
  value?: string
  placeholder?: string
  onChange?: Dispatch<string>
  isValid?: (value: string) => boolean
  label: string
  alert?: AlertProps
  action?: Action
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  (
    {
      className,
      value,
      placeholder = "",
      onChange,
      onBlur,
      onFocus,
      isValid,
      action,
      ...labelProps
    },
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

    return (
      <Decorator.Border action={action} className={cn(isMobile && "w-56")}>
        <Decorator.Label {...labelProps} className={"cursor-text"}>
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
        </Decorator.Label>
      </Decorator.Border>
    )
  }
)
