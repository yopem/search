"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Menu,
  MenuPopup,
  MenuRadioGroup,
  MenuRadioItem,
  MenuTrigger,
} from "@/components/ui/menu"

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

interface SettingsDefaultFiltersProps {
  defaultLanguage?: string
  defaultTimeRange?: string
  defaultSafeSearch?: string
  filteredLanguages: { code: string; name: string }[]
  selectedLanguage?: { code: string; name: string } | null
  onLanguageChange: (value: string) => void
  onTimeRangeChange: (value: string) => void
  onSafeSearchChange: (value: string) => void
  onLanguageSearchChange: (query: string) => void
  languageSearchQuery: string
}

const SettingsDefaultFilters = ({
  defaultLanguage,
  defaultTimeRange,
  defaultSafeSearch,
  filteredLanguages,
  selectedLanguage,
  onLanguageChange,
  onTimeRangeChange,
  onSafeSearchChange,
  onLanguageSearchChange,
  languageSearchQuery,
}: SettingsDefaultFiltersProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Default Search Filters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Field>
          <FieldLabel>Language</FieldLabel>
          <FieldDescription>
            Default language for search results
          </FieldDescription>
          <Menu>
            <MenuTrigger
              render={
                <Button variant="outline" className="mt-2">
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
                    onLanguageSearchChange(e.target.value)
                  }}
                  onKeyDown={(e) => e.stopPropagation()}
                  className="h-8"
                />
              </div>
              <MenuRadioGroup
                value={defaultLanguage ?? ""}
                onValueChange={onLanguageChange}
              >
                <MenuRadioItem value="">Auto</MenuRadioItem>
                {filteredLanguages.map(
                  (lang: { code: string; name: string }) => (
                    <MenuRadioItem key={lang.code} value={lang.code}>
                      {lang.name}
                    </MenuRadioItem>
                  ),
                )}
              </MenuRadioGroup>
            </MenuPopup>
          </Menu>
        </Field>

        <Field>
          <FieldLabel>Time range</FieldLabel>
          <FieldDescription>
            Default time range filter for search results
          </FieldDescription>
          <Menu>
            <MenuTrigger
              render={
                <Button variant="outline" className="mt-2">
                  {TIME_RANGES.find((t) => t.value === defaultTimeRange)
                    ?.label ?? "Any time"}
                </Button>
              }
            />
            <MenuPopup>
              <MenuRadioGroup
                value={defaultTimeRange ?? ""}
                onValueChange={onTimeRangeChange}
              >
                {TIME_RANGES.map((option) => (
                  <MenuRadioItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuRadioItem>
                ))}
              </MenuRadioGroup>
            </MenuPopup>
          </Menu>
        </Field>

        <Field>
          <FieldLabel>Safe search</FieldLabel>
          <FieldDescription>Default safe search filter level</FieldDescription>
          <Menu>
            <MenuTrigger
              render={
                <Button variant="outline" className="mt-2">
                  {SAFE_SEARCH_OPTIONS.find(
                    (s) => s.value === defaultSafeSearch,
                  )?.label ?? "Moderate"}
                </Button>
              }
            />
            <MenuPopup>
              <MenuRadioGroup
                value={defaultSafeSearch ?? ""}
                onValueChange={onSafeSearchChange}
              >
                {SAFE_SEARCH_OPTIONS.map((option) => (
                  <MenuRadioItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuRadioItem>
                ))}
              </MenuRadioGroup>
            </MenuPopup>
          </Menu>
        </Field>
      </CardContent>
    </Card>
  )
}

export default SettingsDefaultFilters
