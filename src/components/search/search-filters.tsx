"use client"

import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { FilterIcon as FilterXIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Menu, MenuItem, MenuPopup, MenuTrigger } from "@/components/ui/menu"
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

const REGIONS = [
  { value: "", label: "Auto" },
  { value: "en-US", label: "United States" },
  { value: "en-GB", label: "United Kingdom" },
  { value: "de-DE", label: "Germany" },
  { value: "fr-FR", label: "France" },
  { value: "ja-JP", label: "Japan" },
  { value: "es-ES", label: "Spain" },
  { value: "pt-BR", label: "Brazil" },
  { value: "id-ID", label: "Indonesia" },
]

const SAFE_SEARCH_OPTIONS = [
  { value: "0", label: "Off" },
  { value: "1", label: "Moderate" },
  { value: "2", label: "Strict" },
]

const SearchFilters = ({
  timeRange,
  region,
  safeSearch,
  language,
  onTimeRangeChange,
  onRegionChange,
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

  const filteredLanguages = useMemo(() => {
    if (!languageSearchQuery) return languages

    const query = languageSearchQuery.toLowerCase()
    return languages.filter(
      (lang: { code: string; name: string }) =>
        lang.name.toLowerCase().includes(query) ||
        lang.code.toLowerCase().includes(query),
    )
  }, [languageSearchQuery, languages])

  const hasActiveFilters =
    timeRange !== "" || region !== "" || safeSearch !== "2" || language !== ""

  const selectedLanguage = languages.find(
    (lang: { code: string; name: string }) => lang.code === language,
  )

  return (
    <div className="flex flex-wrap items-center gap-2 py-3">
      <Menu>
        <MenuTrigger
          render={
            <Button variant="outline" size="sm">
              {TIME_RANGES.find((t) => t.value === timeRange)?.label ??
                "Any time"}
            </Button>
          }
        />
        <MenuPopup>
          {TIME_RANGES.map((option) => (
            <MenuItem
              key={option.value}
              onClick={() => onTimeRangeChange(option.value)}
            >
              {option.label}
            </MenuItem>
          ))}
        </MenuPopup>
      </Menu>

      <Menu>
        <MenuTrigger
          render={
            <Button variant="outline" size="sm">
              {selectedLanguage ? selectedLanguage.name : "Language"}
            </Button>
          }
        />
        <MenuPopup>
          <div className="p-2">
            <Input
              type="text"
              placeholder="Search languages..."
              value={languageSearchQuery}
              onChange={(e) => setLanguageSearchQuery(e.target.value)}
              className="h-8"
            />
          </div>
          <MenuItem onClick={() => onLanguageChange("")}>Auto</MenuItem>
          {filteredLanguages.map((lang: { code: string; name: string }) => (
            <MenuItem
              key={lang.code}
              onClick={() => {
                onLanguageChange(lang.code)
                setLanguageSearchQuery("")
              }}
            >
              {lang.name}
            </MenuItem>
          ))}
        </MenuPopup>
      </Menu>

      <Menu>
        <MenuTrigger
          render={
            <Button variant="outline" size="sm">
              {REGIONS.find((r) => r.value === region)?.label ?? "Auto"}
            </Button>
          }
        />
        <MenuPopup>
          {REGIONS.map((option) => (
            <MenuItem
              key={option.value}
              onClick={() => onRegionChange(option.value)}
            >
              {option.label}
            </MenuItem>
          ))}
        </MenuPopup>
      </Menu>

      <Menu>
        <MenuTrigger
          render={
            <Button variant="outline" size="sm">
              Safe:{" "}
              {SAFE_SEARCH_OPTIONS.find((s) => s.value === safeSearch)?.label ??
                "Moderate"}
            </Button>
          }
        />
        <MenuPopup>
          {SAFE_SEARCH_OPTIONS.map((option) => (
            <MenuItem
              key={option.value}
              onClick={() => onSafeSearchChange(option.value)}
            >
              {option.label}
            </MenuItem>
          ))}
        </MenuPopup>
      </Menu>

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
