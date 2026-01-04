"use client"

import { useEffect, useState } from "react"
import { SearchIcon } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Kbd, KbdGroup } from "@/components/ui/kbd"

interface SearchAutocompleteInputProps {
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onKeyDown: (e: React.KeyboardEvent) => void
  onFocus: () => void
  onBlur: () => void
  placeholder: string
  showKbdHint: boolean
  alwaysShowKbd: boolean
  isFocused: boolean
}

const SearchAutocompleteInput = ({
  value,
  onChange,
  onKeyDown,
  onFocus,
  onBlur,
  placeholder,
  showKbdHint,
  alwaysShowKbd,
  isFocused,
}: SearchAutocompleteInputProps) => {
  const [isMac, setIsMac] = useState(false)

  useEffect(() => {
    setIsMac(/(Mac|iPhone|iPod|iPad)/i.test(navigator.userAgent))
  }, [])

  return (
    <div className="relative">
      <Input
        type="search"
        name="q"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        onFocus={onFocus}
        onBlur={onBlur}
        className="pr-10"
        size="lg"
        autoComplete="off"
      />
      {showKbdHint && !isFocused && (alwaysShowKbd || value.length === 0) && (
        <div className="pointer-events-none absolute top-1/2 right-14 z-10 hidden -translate-y-1/2 items-center gap-1 md:flex">
          <KbdGroup>
            <Kbd>{isMac ? "⌘" : "Ctrl"}</Kbd>
            <Kbd>K</Kbd>
          </KbdGroup>
        </div>
      )}
      <button
        type="submit"
        className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 transition-colors"
        aria-label="Search"
      >
        <SearchIcon className="h-4 w-4" />
      </button>
    </div>
  )
}

export default SearchAutocompleteInput
