import { forwardRef } from "preact/compat"

import { breakpoint } from "~/data/breakpoint"
import { useAtomValue } from "~/data/yaasl"
import { cn } from "~/utils/cn"

import { Decorator, AlertProps, Action } from "./Decorator"
import { TextField, TextFieldProps } from "./TextField"

export interface TextInputProps extends TextFieldProps {
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
    ref
  ) => {
    const { isMobile } = useAtomValue(breakpoint)

    return (
      <Decorator.Border action={action} className={cn(isMobile && "w-56")}>
        <Decorator.Label {...labelProps} className={"cursor-text"}>
          <TextField
            ref={ref}
            value={value}
            placeholder={placeholder}
            onChange={onChange}
            onBlur={onBlur}
            onFocus={onFocus}
            className={className}
            isValid={isValid}
          />
        </Decorator.Label>
      </Decorator.Border>
    )
  }
)
