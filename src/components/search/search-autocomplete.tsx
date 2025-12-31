"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Search } from "lucide-react"

import { Input } from "@/components/ui/input"
import { queryApi } from "@/lib/orpc/query"

interface SearchAutocompleteProps {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  placeholder?: string
}

export function SearchAutocomplete({
  value,
  onChange,
  onSubmit,
  placeholder = "Search the web...",
}: SearchAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false)

  const { data: suggestions = [] } = useQuery({
    ...queryApi.search.autocomplete.queryOptions({
      input: { query: value },
    }),
    enabled: value.length > 1,
  })

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      setIsOpen(false)
      onSubmit()
    } else if (e.key === "Escape") {
      setIsOpen(false)
    } else if (e.key === "ArrowDown" && suggestions.length > 0) {
      e.preventDefault()
      setIsOpen(true)
    }
  }

  const handleSelect = (suggestion: string) => {
    onChange(suggestion)
    setIsOpen(false)
    setTimeout(() => onSubmit(), 100)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
    setIsOpen(e.target.value.length > 1)
  }

  const handleBlur = () => {
    setTimeout(() => setIsOpen(false), 200)
  }

  const showSuggestions = isOpen && suggestions.length > 0

  return (
    <div className="relative w-full">
      <div className="relative">
        <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
        <Input
          type="search"
          placeholder={placeholder}
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => value.length > 1 && setIsOpen(true)}
          onBlur={handleBlur}
          className="pl-10"
          autoComplete="off"
        />
      </div>

      {showSuggestions && (
        <div className="bg-popover absolute top-full right-0 left-0 z-50 mt-1 rounded-md border shadow-md">
          <div className="max-h-[300px] overflow-y-auto p-1">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleSelect(suggestion)}
                className="hover:bg-accent hover:text-accent-foreground flex w-full items-center gap-2 rounded-sm px-3 py-2 text-left text-sm"
              >
                <Search className="text-muted-foreground h-4 w-4" />
                <span>{suggestion}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
