"use client"

import SearchFilterButton from "@/components/search/search-filter-button"
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
  return (
    <Menu>
      <MenuTrigger
        render={
          <SearchFilterButton label={label} value={value} options={options} />
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
