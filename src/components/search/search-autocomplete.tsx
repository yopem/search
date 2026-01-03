"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { SearchIcon } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Kbd, KbdGroup } from "@/components/ui/kbd"
import { ScrollArea } from "@/components/ui/scroll-area"
import { queryApi } from "@/lib/orpc/query"

interface SearchAutocompleteProps {
  value: string
  onChange: (value: string) => void
  onSubmit: (value?: string) => void
  placeholder?: string
  showKbdHint?: boolean
  alwaysShowKbd?: boolean
  language?: string
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
  showKbdHint = false,
  alwaysShowKbd = false,
  language,
}: SearchAutocompleteProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const [isFocused, setIsFocused] = useState(false)
  const queryClient = useQueryClient()
  const suggestionRefs = useRef<(HTMLButtonElement | null)[]>([])
  const [isMac, setIsMac] = useState(false)

  useEffect(() => {
    setIsMac(/(Mac|iPhone|iPod|iPad)/i.test(navigator.userAgent))
  }, [])

  const debouncedValue = useDebounce(value, 300)

  const { data: suggestions = [] } = useQuery({
    ...queryApi.search.autocomplete.queryOptions({
      input: {
        query: debouncedValue,
        language: language ?? undefined,
      },
    }),
    enabled: debouncedValue.length > 1,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })

  const filteredSuggestions = useMemo(() => {
    return suggestions.filter((s) => s.toLowerCase() !== value.toLowerCase())
  }, [suggestions, value])

  // Close autocomplete when value becomes too short
  useEffect(() => {
    if (value.length <= 1) {
      setIsOpen(false)
    }
  }, [value])

  useEffect(() => {
    setHighlightedIndex(-1)
  }, [filteredSuggestions])

  useEffect(() => {
    if (highlightedIndex >= 0 && suggestionRefs.current[highlightedIndex]) {
      suggestionRefs.current[highlightedIndex]?.scrollIntoView({
        block: "nearest",
        behavior: "smooth",
      })
    }
  }, [highlightedIndex])

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
      if (
        highlightedIndex >= 0 &&
        highlightedIndex < filteredSuggestions.length
      ) {
        handleSelect(filteredSuggestions[highlightedIndex])
      } else {
        handleSubmit()
      }
    } else if (e.key === "Escape") {
      setIsOpen(false)
      setHighlightedIndex(-1)
    } else if (e.key === "ArrowDown") {
      e.preventDefault()
      if (!isOpen && filteredSuggestions.length > 0) {
        setIsOpen(true)
        setHighlightedIndex(0)
      } else if (highlightedIndex < filteredSuggestions.length - 1) {
        setHighlightedIndex(highlightedIndex + 1)
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      if (highlightedIndex > 0) {
        setHighlightedIndex(highlightedIndex - 1)
      } else if (highlightedIndex === 0) {
        setHighlightedIndex(-1)
      }
    }
  }

  const handleSelect = (suggestion: string) => {
    onChange(suggestion)
    void queryClient.cancelQueries({
      predicate: (query) =>
        query.queryKey[0] === "search" && query.queryKey[1] === "autocomplete",
    })
    setIsOpen(false)
    setHighlightedIndex(-1)
    onSubmit(suggestion)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitized = e.target.value.slice(0, 500)
    onChange(sanitized)
    if (sanitized.length > 1) {
      setIsOpen(true)
    }
  }

  const handleBlur = () => {
    setTimeout(() => {
      setIsOpen(false)
      setHighlightedIndex(-1)
      setIsFocused(false)
    }, 200)
  }

  const handleFocus = () => {
    setIsFocused(true)
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
          name="q"
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

      {showSuggestions && (
        <div className="bg-popover absolute top-full right-0 left-0 z-50 mt-1 rounded-md border shadow-md">
          <ScrollArea className="h-[20vh]">
            <div className="p-1">
              {filteredSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  ref={(el) => {
                    suggestionRefs.current[index] = el
                  }}
                  onClick={() => handleSelect(suggestion)}
                  className={`flex w-full items-center gap-2 rounded-sm px-3 py-2 text-left text-sm ${
                    index === highlightedIndex
                      ? "bg-accent text-accent-foreground"
                      : "hover:bg-accent hover:text-accent-foreground"
                  }`}
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
