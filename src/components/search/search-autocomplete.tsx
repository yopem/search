"use client"

import { useEffect, useMemo, useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { SearchIcon } from "lucide-react"

import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { queryApi } from "@/lib/orpc/query"

interface SearchAutocompleteProps {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  placeholder?: string
}

const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

const SearchAutocomplete = ({
  value,
  onChange,
  onSubmit,
  placeholder = "Search the web...",
}: SearchAutocompleteProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const queryClient = useQueryClient()

  const debouncedValue = useDebounce(value, 300)

  const { data: suggestions = [], isFetching } = useQuery({
    ...queryApi.search.autocomplete.queryOptions({
      input: { query: debouncedValue },
    }),
    enabled: debouncedValue.length > 1,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })

  const filteredSuggestions = useMemo(() => {
    return suggestions.filter((s) => s.toLowerCase() !== value.toLowerCase())
  }, [suggestions, value])

  useEffect(() => {
    if (value.length > 1 && filteredSuggestions.length > 0 && !isFetching) {
      setIsOpen(true)
    } else if (value.length <= 1) {
      setIsOpen(false)
    }
  }, [value, filteredSuggestions, isFetching])

  useEffect(() => {
    return () => {
      void queryClient.cancelQueries({
        predicate: (query) =>
          query.queryKey[0] === "search" &&
          query.queryKey[1] === "autocomplete",
      })
    }
  }, [queryClient])

  const handleSubmit = () => {
    void queryClient.cancelQueries({
      predicate: (query) =>
        query.queryKey[0] === "search" && query.queryKey[1] === "autocomplete",
    })
    setIsOpen(false)
    onSubmit()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleSubmit()
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
    setTimeout(() => handleSubmit(), 100)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitized = e.target.value.slice(0, 500)
    onChange(sanitized)
  }

  const handleBlur = () => {
    setTimeout(() => setIsOpen(false), 200)
  }

  const handleFocus = () => {
    if (value.length > 1 && filteredSuggestions.length > 0) {
      setIsOpen(true)
    }
  }

  const showSuggestions = isOpen && filteredSuggestions.length > 0

  return (
    <div className="relative w-full">
      <div className="relative">
        <Input
          type="search"
          placeholder={placeholder}
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className="pr-10"
          size="lg"
          autoComplete="off"
        />
        <button
          type="button"
          onClick={handleSubmit}
          className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 transition-colors"
          aria-label="Search"
        >
          <SearchIcon className="h-4 w-4" />
        </button>
      </div>

      {showSuggestions && (
        <div className="bg-popover absolute top-full right-0 left-0 z-50 mt-1 rounded-md border shadow-md">
          <ScrollArea className="h-[20vh]">
            <div className="p-1">
              {filteredSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSelect(suggestion)}
                  className="hover:bg-accent hover:text-accent-foreground flex w-full items-center gap-2 rounded-sm px-3 py-2 text-left text-sm"
                >
                  <SearchIcon className="text-muted-foreground h-4 w-4" />
                  <span>{suggestion}</span>
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  )
}

export default SearchAutocomplete
