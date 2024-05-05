import { Placement } from "@floating-ui/react"

import { Button, ButtonProps } from "./Button"
import { Dropdown } from "./dropdown/Dropdown"
import { MenuList } from "./MenuList"

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

    <Dropdown.Content>
      <Dropdown.Arrow />
      <Dropdown.Close>
        <MenuList.Root>
          {items.map(({ label, value }) => (
            <MenuList.Item key={value} onClick={() => onSelect?.(value)}>
              {label}
            </MenuList.Item>
          ))}
        </MenuList.Root>
      </Dropdown.Close>
    </Dropdown.Content>
  </Dropdown.Root>
)
