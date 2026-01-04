"use client"

import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { FilterIcon as FilterXIcon } from "lucide-react"

import SearchFilterMenu from "@/components/search/search-filter-menu"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Menu,
  MenuPopup,
  MenuRadioGroup,
  MenuRadioItem,
  MenuTrigger,
} from "@/components/ui/menu"
import { queryApi } from "@/lib/orpc/query"

interface SearchFiltersProps {
  timeRange: string
  region: string
  safeSearch: string
  language: string
  onTimeRangeChange: (value: string) => void
  onRegionChange: (value: string) => void
  onSafeSearchChange: (value: string) => void
  onLanguageChange: (value: string) => void
  onClearFilters: () => void
}

const TIME_RANGES = [
  { value: "", label: "Any time" },
  { value: "day", label: "Past day" },
  { value: "week", label: "Past week" },
  { value: "month", label: "Past month" },
  { value: "year", label: "Past year" },
]

const SAFE_SEARCH_OPTIONS = [
  { value: "0", label: "Off" },
  { value: "1", label: "Moderate" },
  { value: "2", label: "Strict" },
]

const MAJOR_LANGUAGE_CODES = [
  "en",
  "zh",
  "es",
  "hi",
  "ar",
  "pt",
  "bn",
  "ru",
  "ja",
  "de",
  "fr",
  "ko",
  "it",
  "tr",
  "vi",
  "pl",
  "uk",
  "nl",
  "th",
  "id",
]

const SearchFilters = ({
  timeRange,
  region,
  safeSearch,
  language,
  onTimeRangeChange,
  onSafeSearchChange,
  onLanguageChange,
  onClearFilters,
}: SearchFiltersProps) => {
  const [languageSearchQuery, setLanguageSearchQuery] = useState("")

  const { data: languagesData } = useQuery(
    queryApi.search.getLanguages.queryOptions({
      input: {},
    }),
  )

  const languages = useMemo(() => languagesData ?? [], [languagesData])

  const majorLanguages = useMemo(
    () =>
      languages.filter((lang: { code: string; name: string }) =>
        MAJOR_LANGUAGE_CODES.includes(lang.code),
      ),
    [languages],
  )

  const filteredLanguages = useMemo(() => {
    if (!languageSearchQuery) return majorLanguages

    const query = languageSearchQuery.toLowerCase()
    return majorLanguages.filter(
      (lang: { code: string; name: string }) =>
        lang.name.toLowerCase().includes(query) ||
        lang.code.toLowerCase().includes(query),
    )
  }, [languageSearchQuery, majorLanguages])

  const hasActiveFilters =
    timeRange !== "" || region !== "" || safeSearch !== "2" || language !== ""

  const selectedLanguage = languages.find(
    (lang: { code: string; name: string }) => lang.code === language,
  )

  return (
    <div className="flex flex-wrap items-center gap-2 py-3">
      <SearchFilterMenu
        label="Any time"
        value={timeRange}
        options={TIME_RANGES}
        onValueChange={onTimeRangeChange}
      />

      <Menu>
        <MenuTrigger
          render={
            <Button variant="outline" size="sm">
              {selectedLanguage ? selectedLanguage.name : "Auto (English)"}
            </Button>
          }
        />
        <MenuPopup>
          <div className="p-2">
            <Input
              type="text"
              placeholder="Search languages..."
              value={languageSearchQuery}
              onChange={(e) => {
                e.stopPropagation()
                setLanguageSearchQuery(e.target.value)
              }}
              onKeyDown={(e) => e.stopPropagation()}
              className="h-8"
            />
          </div>
          <MenuRadioGroup
            value={language}
            onValueChange={(value) => {
              onLanguageChange(value)
              setLanguageSearchQuery("")
            }}
          >
            <MenuRadioItem value="">Auto</MenuRadioItem>
            {filteredLanguages.map((lang: { code: string; name: string }) => (
              <MenuRadioItem key={lang.code} value={lang.code}>
                {lang.name}
              </MenuRadioItem>
            ))}
          </MenuRadioGroup>
        </MenuPopup>
      </Menu>

      <SearchFilterMenu
        label="Safe: Moderate"
        value={safeSearch}
        options={SAFE_SEARCH_OPTIONS}
        onValueChange={onSafeSearchChange}
      />

      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearFilters}
          className="text-muted-foreground"
        >
          <FilterXIcon className="mr-1 h-3.5 w-3.5" />
          Clear filters
        </Button>
      )}
    </div>
  )
}

export default SearchFilters
