"use client"

import { Button } from "@/components/ui/button"
import {
  Menu,
  MenuPopup,
  MenuRadioGroup,
  MenuRadioItem,
  MenuTrigger,
} from "@/components/ui/menu"

interface SearchFilterMenuProps {
  label: string
  value: string
  options: { value: string; label: string }[]
  onValueChange: (value: string) => void
}

const SearchFilterMenu = ({
  label,
  value,
  options,
  onValueChange,
}: SearchFilterMenuProps) => {
  const selectedOption = options.find((opt) => opt.value === value)

  return (
    <Menu>
      <MenuTrigger
        render={
          <Button variant="outline" size="sm">
            {selectedOption?.label ?? label}
          </Button>
        }
      />
      <MenuPopup>
        <MenuRadioGroup value={value} onValueChange={onValueChange}>
          {options.map((option) => (
            <MenuRadioItem key={option.value} value={option.value}>
              {option.label}
            </MenuRadioItem>
          ))}
        </MenuRadioGroup>
      </MenuPopup>
    </Menu>
  )
}

export default SearchFilterMenu
