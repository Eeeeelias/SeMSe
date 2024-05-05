import { createContext } from "preact"

import { Composite, CompositeItem } from "@floating-ui/react"
import { forwardRef } from "preact/compat"
import { useContext } from "preact/hooks"

import { ChildrenProp } from "./base/BaseProps"
import { Slot } from "./base/Slot"
import { Button } from "./Button"

type MenuRole = "listbox" | "menu"
type ItemRole = "option" | "menuitem"

interface ContextState {
  itemRole: ItemRole
}
const Context = createContext<ContextState | null>(null)
Context.displayName = "MenuList.Context"
const useMenuList = () => {
  const context = useContext(Context)
  if (!context) throw new Error("MenuList: missing context")
  return context
}

interface ItemProps extends ChildrenProp {
  onClick?: () => void
}
const Item = forwardRef<HTMLLIElement, ItemProps>(({ children }, ref) => {
  const { itemRole } = useMenuList()
  return (
    <CompositeItem
      render={(props: object) => (
        <li ref={ref} role={itemRole}>
          <Button {...props} className="w-full">
            {children}
          </Button>
        </li>
      )}
    />
  )
})

interface RootProps extends ChildrenProp {
  role?: MenuRole
}
const Root = forwardRef<HTMLUListElement, RootProps>(
  ({ role = "menu", ...props }, ref) => (
    <Context.Provider
      value={{ itemRole: role === "menu" ? "menuitem" : "option" }}
    >
      <Composite
        render={(composite: object) => (
          <Slot {...composite}>
            <ul {...props} ref={ref} role={role} />
          </Slot>
        )}
      />
    </Context.Provider>
  )
)

export const MenuList = {
  Root,
  Item,
}
