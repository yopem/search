"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"

import SearchAutocompleteInput from "@/components/search/search-autocomplete-input"
import SearchAutocompleteSuggestions from "@/components/search/search-autocomplete-suggestions"
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
      <SearchAutocompleteInput
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        showKbdHint={showKbdHint}
        alwaysShowKbd={alwaysShowKbd}
        isFocused={isFocused}
      />

      {showSuggestions && (
        <SearchAutocompleteSuggestions
          suggestions={filteredSuggestions}
          highlightedIndex={highlightedIndex}
          onSelect={handleSelect}
          suggestionRefs={suggestionRefs}
        />
      )}
    </div>
  )
}

export default SearchAutocomplete
