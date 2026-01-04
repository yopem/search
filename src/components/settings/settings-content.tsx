"use client"

import { useMemo, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import SettingsBangsSection from "@/components/settings/settings-bangs-section"
import SettingsCategories from "@/components/settings/settings-categories"
import SettingsDefaultFilters from "@/components/settings/settings-default-filters"
import SettingsInstantAnswers from "@/components/settings/settings-instant-answers"
import SettingsLinkBehavior from "@/components/settings/settings-link-behavior"
import SettingsSearchHistory from "@/components/settings/settings-search-history"
import SettingsSearchResults from "@/components/settings/settings-search-results"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { toastManager } from "@/components/ui/toast"
import { queryApi } from "@/lib/orpc/query"

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

  const handleToggleCalculator = (checked: boolean) => {
    updateMutation.mutate({ showCalculator: checked })
    toastManager.add({
      title: "Settings updated",
      description: checked
        ? "Calculator instant answer enabled"
        : "Calculator instant answer disabled",
    })
  }

  const handleToggleUnitConverter = (checked: boolean) => {
    updateMutation.mutate({ showUnitConverter: checked })
    toastManager.add({
      title: "Settings updated",
      description: checked
        ? "Unit converter instant answer enabled"
        : "Unit converter instant answer disabled",
    })
  }

  const handleToggleWeather = (checked: boolean) => {
    updateMutation.mutate({ showWeather: checked })
    toastManager.add({
      title: "Settings updated",
      description: checked
        ? "Weather instant answer enabled"
        : "Weather instant answer disabled",
    })
  }

  const handleToggleImagesCategory = (checked: boolean) => {
    if (!checked) {
      const enabledCount = [
        settings?.showImagesCategory,
        settings?.showNewsCategory,
        settings?.showVideosCategory,
        settings?.showMusicCategory,
        settings?.showMapCategory,
        settings?.showScienceCategory,
        settings?.showFilesCategory,
        settings?.showSocialMediaCategory,
        settings?.showTechCategory,
      ].filter(Boolean).length

      if (enabledCount <= 1) {
        toastManager.add({
          title: "Cannot disable category",
          description: "At least one category must be visible",
        })
        return
      }
    }

    updateMutation.mutate({ showImagesCategory: checked })
    toastManager.add({
      title: "Settings updated",
      description: checked
        ? "Images category enabled"
        : "Images category hidden",
    })
  }

  const handleToggleNewsCategory = (checked: boolean) => {
    if (!checked) {
      const enabledCount = [
        settings?.showImagesCategory,
        settings?.showNewsCategory,
        settings?.showVideosCategory,
        settings?.showMusicCategory,
        settings?.showMapCategory,
        settings?.showScienceCategory,
        settings?.showFilesCategory,
        settings?.showSocialMediaCategory,
        settings?.showTechCategory,
      ].filter(Boolean).length

      if (enabledCount <= 1) {
        toastManager.add({
          title: "Cannot disable category",
          description: "At least one category must be visible",
        })
        return
      }
    }

    updateMutation.mutate({ showNewsCategory: checked })
    toastManager.add({
      title: "Settings updated",
      description: checked ? "News category enabled" : "News category hidden",
    })
  }

  const handleToggleVideosCategory = (checked: boolean) => {
    if (!checked) {
      const enabledCount = [
        settings?.showImagesCategory,
        settings?.showNewsCategory,
        settings?.showVideosCategory,
        settings?.showMusicCategory,
        settings?.showMapCategory,
        settings?.showScienceCategory,
        settings?.showFilesCategory,
        settings?.showSocialMediaCategory,
        settings?.showTechCategory,
      ].filter(Boolean).length

      if (enabledCount <= 1) {
        toastManager.add({
          title: "Cannot disable category",
          description: "At least one category must be visible",
        })
        return
      }
    }

    updateMutation.mutate({ showVideosCategory: checked })
    toastManager.add({
      title: "Settings updated",
      description: checked
        ? "Videos category enabled"
        : "Videos category hidden",
    })
  }

  const handleToggleMusicCategory = (checked: boolean) => {
    if (!checked) {
      const enabledCount = [
        settings?.showImagesCategory,
        settings?.showNewsCategory,
        settings?.showVideosCategory,
        settings?.showMusicCategory,
        settings?.showMapCategory,
        settings?.showScienceCategory,
        settings?.showFilesCategory,
        settings?.showSocialMediaCategory,
        settings?.showTechCategory,
      ].filter(Boolean).length

      if (enabledCount <= 1) {
        toastManager.add({
          title: "Cannot disable category",
          description: "At least one category must be visible",
        })
        return
      }
    }

    updateMutation.mutate({ showMusicCategory: checked })
    toastManager.add({
      title: "Settings updated",
      description: checked ? "Music category enabled" : "Music category hidden",
    })
  }

  const handleToggleMapCategory = (checked: boolean) => {
    updateMutation.mutate({ showMapCategory: checked })
    toastManager.add({
      title: "Settings updated",
      description: checked ? "Map category enabled" : "Map category hidden",
    })
  }

  const handleToggleScienceCategory = (checked: boolean) => {
    updateMutation.mutate({ showScienceCategory: checked })
    toastManager.add({
      title: "Settings updated",
      description: checked
        ? "Science category enabled"
        : "Science category hidden",
    })
  }

  const handleToggleFilesCategory = (checked: boolean) => {
    updateMutation.mutate({ showFilesCategory: checked })
    toastManager.add({
      title: "Settings updated",
      description: checked ? "Files category enabled" : "Files category hidden",
    })
  }

  const handleToggleSocialMediaCategory = (checked: boolean) => {
    updateMutation.mutate({ showSocialMediaCategory: checked })
    toastManager.add({
      title: "Settings updated",
      description: checked
        ? "Social Media category enabled"
        : "Social Media category hidden",
    })
  }

  const handleToggleTechCategory = (checked: boolean) => {
    updateMutation.mutate({ showTechCategory: checked })
    toastManager.add({
      title: "Settings updated",
      description: checked ? "Tech category enabled" : "Tech category hidden",
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

        <SettingsBangsSection />

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
      <SettingsLinkBehavior
        openInNewTab={settings?.openInNewTab}
        onToggle={handleToggleOpenInNewTab}
        disabled={updateMutation.isPending}
      />

      <SettingsBangsSection />

      <SettingsSearchResults
        showInfoboxPanels={settings?.showInfoboxPanels}
        onToggleInfoboxPanels={handleToggleInfoboxPanels}
        disabled={updateMutation.isPending}
      />

      <SettingsInstantAnswers
        showCalculator={settings?.showCalculator}
        showUnitConverter={settings?.showUnitConverter}
        showWeather={settings?.showWeather}
        onToggleCalculator={handleToggleCalculator}
        onToggleUnitConverter={handleToggleUnitConverter}
        onToggleWeather={handleToggleWeather}
        disabled={updateMutation.isPending}
      />

      <SettingsCategories
        showImagesCategory={settings?.showImagesCategory}
        showNewsCategory={settings?.showNewsCategory}
        showVideosCategory={settings?.showVideosCategory}
        showMusicCategory={settings?.showMusicCategory}
        showMapCategory={settings?.showMapCategory}
        showScienceCategory={settings?.showScienceCategory}
        showFilesCategory={settings?.showFilesCategory}
        showSocialMediaCategory={settings?.showSocialMediaCategory}
        showTechCategory={settings?.showTechCategory}
        onToggleImagesCategory={handleToggleImagesCategory}
        onToggleNewsCategory={handleToggleNewsCategory}
        onToggleVideosCategory={handleToggleVideosCategory}
        onToggleMusicCategory={handleToggleMusicCategory}
        onToggleMapCategory={handleToggleMapCategory}
        onToggleScienceCategory={handleToggleScienceCategory}
        onToggleFilesCategory={handleToggleFilesCategory}
        onToggleSocialMediaCategory={handleToggleSocialMediaCategory}
        onToggleTechCategory={handleToggleTechCategory}
        disabled={updateMutation.isPending}
      />

      <SettingsDefaultFilters
        defaultLanguage={settings?.defaultLanguage ?? undefined}
        defaultTimeRange={settings?.defaultTimeRange ?? undefined}
        defaultSafeSearch={settings?.defaultSafeSearch ?? undefined}
        filteredLanguages={filteredLanguages}
        selectedLanguage={selectedLanguage}
        onLanguageChange={handleLanguageChange}
        onTimeRangeChange={handleTimeRangeChange}
        onSafeSearchChange={handleSafeSearchChange}
        onLanguageSearchChange={setLanguageSearchQuery}
        languageSearchQuery={languageSearchQuery}
      />

      <SettingsSearchHistory
        showSearchHistory={settings?.showSearchHistory}
        onToggleSearchHistory={handleToggleSearchHistory}
        disabled={updateMutation.isPending}
      />
    </div>
  )
}

export default SettingsContent
