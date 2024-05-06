import { Placement } from "@floating-ui/react"

import { Button, ButtonProps } from "./Button"
import { Dropdown } from "./dropdown/Dropdown"

interface ListItem {
  label: string
  value: string
}

interface MenuButtonProps extends ButtonProps {
  items: ListItem[]
  onSelect?: (value: string) => void
  placement?: Placement
}
export const MenuButton = ({
  items,
  onSelect,
  placement = "bottom-start",
  ...buttonProps
}: MenuButtonProps) => (
  <Dropdown.Root placement={placement}>
    <Dropdown.Trigger>
      <Button {...buttonProps} />
    </Dropdown.Trigger>

    <Dropdown.Close>
      <Dropdown.Menu>
        <Dropdown.Arrow />
        {items.map(({ label, value }) => (
          <Dropdown.MenuItem key={value} onClick={() => onSelect?.(value)}>
            {label}
          </Dropdown.MenuItem>
        ))}
      </Dropdown.Menu>
    </Dropdown.Close>
  </Dropdown.Root>
)
