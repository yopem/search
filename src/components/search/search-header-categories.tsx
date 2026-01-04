"use client"

import { useMemo } from "react"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface SearchHeaderCategoriesProps {
  category: string
  onCategoryChange: (category: string) => void
  onCategoryHover: (category: string) => void
  userSettings: {
    showImagesCategory?: boolean
    showNewsCategory?: boolean
    showVideosCategory?: boolean
    showMusicCategory?: boolean
    showMapCategory?: boolean
    showScienceCategory?: boolean
    showTechCategory?: boolean
    showFilesCategory?: boolean
    showSocialMediaCategory?: boolean
  } | null
}

const SearchHeaderCategories = ({
  category,
  onCategoryChange,
  onCategoryHover,
  userSettings,
}: SearchHeaderCategoriesProps) => {
  const visibleCategories = useMemo(
    () => [
      { value: "general", label: "All", visible: true },
      {
        value: "images",
        label: "Images",
        visible: userSettings?.showImagesCategory ?? true,
      },
      {
        value: "news",
        label: "News",
        visible: userSettings?.showNewsCategory ?? true,
      },
      {
        value: "videos",
        label: "Videos",
        visible: userSettings?.showVideosCategory ?? true,
      },
      {
        value: "music",
        label: "Music",
        visible: userSettings?.showMusicCategory ?? true,
      },
      {
        value: "map",
        label: "Map",
        visible: userSettings?.showMapCategory ?? false,
      },
      {
        value: "science",
        label: "Science",
        visible: userSettings?.showScienceCategory ?? false,
      },
      {
        value: "tech",
        label: "Tech",
        visible: userSettings?.showTechCategory ?? false,
      },
      {
        value: "files",
        label: "Files",
        visible: userSettings?.showFilesCategory ?? false,
      },
      {
        value: "social_media",
        label: "Social Media",
        visible: userSettings?.showSocialMediaCategory ?? false,
      },
    ],
    [userSettings],
  )

  return (
    <div className="scrollbar-hide overflow-x-auto pb-2">
      <Tabs value={category} onValueChange={onCategoryChange}>
        <TabsList className="h-9 !w-fit">
          {visibleCategories
            .filter((cat) => cat.visible)
            .map((cat) => (
              <TabsTrigger
                key={cat.value}
                value={cat.value}
                onMouseEnter={() => onCategoryHover(cat.value)}
                className="shrink-0 !grow-0 px-3 py-1.5 text-sm"
              >
                {cat.label}
              </TabsTrigger>
            ))}
        </TabsList>
      </Tabs>
    </div>
  )
}

export default SearchHeaderCategories
