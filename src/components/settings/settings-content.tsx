"use client"

import { useMemo, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import SearchHistory from "@/components/search/search-history"
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
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import { toastManager } from "@/components/ui/toast"
import { queryApi } from "@/lib/orpc/query"

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

const SettingsContent = () => {
  const queryClient = useQueryClient()
  const [languageSearchQuery, setLanguageSearchQuery] = useState("")

  const { data: settings, isLoading } = useQuery({
    ...queryApi.userSettings.get.queryOptions({
      input: {},
    }),
  })

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

  const updateMutation = useMutation({
    ...queryApi.userSettings.update.mutationOptions(),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryApi.userSettings.get.queryKey(),
      })
    },
  })

  const handleToggleSearchHistory = (checked: boolean) => {
    updateMutation.mutate({ showSearchHistory: checked })
    toastManager.add({
      title: "Settings updated",
      description: checked
        ? "Search history will be saved"
        : "Search history will not be saved",
    })
  }

  const handleToggleOpenInNewTab = (checked: boolean) => {
    updateMutation.mutate({ openInNewTab: checked })
    toastManager.add({
      title: "Settings updated",
      description: checked
        ? "Links will open in new tabs"
        : "Links will open in same tab",
    })
  }

  const handleToggleInfoboxPanels = (checked: boolean) => {
    updateMutation.mutate({ showInfoboxPanels: checked })
    toastManager.add({
      title: "Settings updated",
      description: checked
        ? "Infobox panels will be shown"
        : "Infobox panels will be hidden",
    })
  }

  const handleLanguageChange = (language: string) => {
    updateMutation.mutate({ defaultLanguage: language || null })
    setLanguageSearchQuery("")
    toastManager.add({
      title: "Settings updated",
      description: language
        ? "Default language preference saved"
        : "Default language cleared",
    })
  }

  const handleTimeRangeChange = (timeRange: string) => {
    updateMutation.mutate({ defaultTimeRange: timeRange || null })
    toastManager.add({
      title: "Settings updated",
      description: timeRange
        ? "Default time range preference saved"
        : "Default time range cleared",
    })
  }

  const handleSafeSearchChange = (safeSearch: string) => {
    updateMutation.mutate({ defaultSafeSearch: safeSearch || null })
    toastManager.add({
      title: "Settings updated",
      description: "Safe search preference saved",
    })
  }

  const selectedLanguage = languages.find(
    (lang: { code: string; name: string }) =>
      lang.code === settings?.defaultLanguage,
  )

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-12 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-12 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Link Behavior</CardTitle>
        </CardHeader>
        <CardContent>
          <Field className="flex flex-row items-center justify-between gap-4">
            <div className="flex-1">
              <FieldLabel>Open links in new tab</FieldLabel>
              <FieldDescription>
                Search results and external links open in a new browser tab
              </FieldDescription>
            </div>
            <Switch
              checked={settings?.openInNewTab ?? true}
              onCheckedChange={handleToggleOpenInNewTab}
              disabled={updateMutation.isPending}
            />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Search Results</CardTitle>
        </CardHeader>
        <CardContent>
          <Field className="flex flex-row items-center justify-between gap-4">
            <div className="flex-1">
              <FieldLabel>Show infobox panels</FieldLabel>
              <FieldDescription>
                Display information panels with details about entities, people,
                places, and organizations
              </FieldDescription>
            </div>
            <Switch
              checked={settings?.showInfoboxPanels ?? true}
              onCheckedChange={handleToggleInfoboxPanels}
              disabled={updateMutation.isPending}
            />
          </Field>
        </CardContent>
      </Card>

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
                    {selectedLanguage
                      ? selectedLanguage.name
                      : "Auto (English)"}
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
                  value={settings?.defaultLanguage ?? ""}
                  onValueChange={handleLanguageChange}
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
                    {TIME_RANGES.find(
                      (t) => t.value === settings?.defaultTimeRange,
                    )?.label ?? "Any time"}
                  </Button>
                }
              />
              <MenuPopup>
                <MenuRadioGroup
                  value={settings?.defaultTimeRange ?? ""}
                  onValueChange={handleTimeRangeChange}
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
            <FieldDescription>
              Default safe search filter level
            </FieldDescription>
            <Menu>
              <MenuTrigger
                render={
                  <Button variant="outline" className="mt-2">
                    {SAFE_SEARCH_OPTIONS.find(
                      (s) => s.value === settings?.defaultSafeSearch,
                    )?.label ?? "Moderate"}
                  </Button>
                }
              />
              <MenuPopup>
                <MenuRadioGroup
                  value={settings?.defaultSafeSearch ?? ""}
                  onValueChange={handleSafeSearchChange}
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

      <Card>
        <CardHeader>
          <CardTitle>Search History</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Field className="flex flex-row items-center justify-between gap-4">
            <div className="flex-1">
              <FieldLabel>Save search history</FieldLabel>
              <FieldDescription>
                Searches you make are saved to help you find things faster
              </FieldDescription>
            </div>
            <Switch
              checked={settings?.showSearchHistory ?? true}
              onCheckedChange={handleToggleSearchHistory}
              disabled={updateMutation.isPending}
            />
          </Field>

          {settings?.showSearchHistory && (
            <div className="pt-4">
              <SearchHistory />
            </div>
          )}

          {!settings?.showSearchHistory && (
            <div className="text-muted-foreground rounded-md border border-dashed p-4 text-center text-sm">
              <p>Search history is currently disabled</p>
              <p className="mt-1 text-xs">Enable to see your past searches</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default SettingsContent
