"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { toastManager } from "@/components/ui/toast"
import { queryApi } from "@/lib/orpc/query"

interface UserSettings {
  showImagesCategory?: boolean
  showNewsCategory?: boolean
  showVideosCategory?: boolean
  showMusicCategory?: boolean
  showMapCategory?: boolean
  showScienceCategory?: boolean
  showFilesCategory?: boolean
  showSocialMediaCategory?: boolean
  showTechCategory?: boolean
}

export const useSettingsMutations = (settings?: UserSettings) => {
  const queryClient = useQueryClient()

  const updateMutation = useMutation({
    ...queryApi.userSettings.update.mutationOptions(),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryApi.userSettings.get.queryKey(),
      })
    },
  })

  const validateCategoryDisable = (): boolean => {
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
      return false
    }
    return true
  }

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
    if (!checked && !validateCategoryDisable()) return

    updateMutation.mutate({ showImagesCategory: checked })
    toastManager.add({
      title: "Settings updated",
      description: checked
        ? "Images category enabled"
        : "Images category hidden",
    })
  }

  const handleToggleNewsCategory = (checked: boolean) => {
    if (!checked && !validateCategoryDisable()) return

    updateMutation.mutate({ showNewsCategory: checked })
    toastManager.add({
      title: "Settings updated",
      description: checked ? "News category enabled" : "News category hidden",
    })
  }

  const handleToggleVideosCategory = (checked: boolean) => {
    if (!checked && !validateCategoryDisable()) return

    updateMutation.mutate({ showVideosCategory: checked })
    toastManager.add({
      title: "Settings updated",
      description: checked
        ? "Videos category enabled"
        : "Videos category hidden",
    })
  }

  const handleToggleMusicCategory = (checked: boolean) => {
    if (!checked && !validateCategoryDisable()) return

    updateMutation.mutate({ showMusicCategory: checked })
    toastManager.add({
      title: "Settings updated",
      description: checked ? "Music category enabled" : "Music category hidden",
    })
  }

  const handleToggleMapCategory = (checked: boolean) => {
    if (!checked && !validateCategoryDisable()) return

    updateMutation.mutate({ showMapCategory: checked })
    toastManager.add({
      title: "Settings updated",
      description: checked ? "Map category enabled" : "Map category hidden",
    })
  }

  const handleToggleScienceCategory = (checked: boolean) => {
    if (!checked && !validateCategoryDisable()) return

    updateMutation.mutate({ showScienceCategory: checked })
    toastManager.add({
      title: "Settings updated",
      description: checked
        ? "Science category enabled"
        : "Science category hidden",
    })
  }

  const handleToggleFilesCategory = (checked: boolean) => {
    if (!checked && !validateCategoryDisable()) return

    updateMutation.mutate({ showFilesCategory: checked })
    toastManager.add({
      title: "Settings updated",
      description: checked ? "Files category enabled" : "Files category hidden",
    })
  }

  const handleToggleSocialMediaCategory = (checked: boolean) => {
    if (!checked && !validateCategoryDisable()) return

    updateMutation.mutate({ showSocialMediaCategory: checked })
    toastManager.add({
      title: "Settings updated",
      description: checked
        ? "Social Media category enabled"
        : "Social Media category hidden",
    })
  }

  const handleToggleTechCategory = (checked: boolean) => {
    if (!checked && !validateCategoryDisable()) return

    updateMutation.mutate({ showTechCategory: checked })
    toastManager.add({
      title: "Settings updated",
      description: checked ? "Tech category enabled" : "Tech category hidden",
    })
  }

  const handleLanguageChange = (language: string) => {
    updateMutation.mutate({ defaultLanguage: language })
    toastManager.add({
      title: "Settings updated",
      description: `Default language set to ${language || "Auto"}`,
    })
  }

  const handleTimeRangeChange = (timeRange: string) => {
    updateMutation.mutate({ defaultTimeRange: timeRange })
    toastManager.add({
      title: "Settings updated",
      description: "Default time range updated",
    })
  }

  const handleSafeSearchChange = (safeSearch: string) => {
    updateMutation.mutate({ defaultSafeSearch: safeSearch })
    toastManager.add({
      title: "Settings updated",
      description: "Safe search setting updated",
    })
  }

  return {
    handleToggleSearchHistory,
    handleToggleOpenInNewTab,
    handleToggleInfoboxPanels,
    handleToggleCalculator,
    handleToggleUnitConverter,
    handleToggleWeather,
    handleToggleImagesCategory,
    handleToggleNewsCategory,
    handleToggleVideosCategory,
    handleToggleMusicCategory,
    handleToggleMapCategory,
    handleToggleScienceCategory,
    handleToggleFilesCategory,
    handleToggleSocialMediaCategory,
    handleToggleTechCategory,
    handleLanguageChange,
    handleTimeRangeChange,
    handleSafeSearchChange,
  }
}
