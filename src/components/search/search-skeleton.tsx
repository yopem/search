"use client"

import SearchSkeletonGeneral from "@/components/search/search-skeleton-general"
import SearchSkeletonImages from "@/components/search/search-skeleton-images"
import SearchSkeletonNews from "@/components/search/search-skeleton-news"
import SearchSkeletonVideos from "@/components/search/search-skeleton-videos"

interface SearchSkeletonProps {
  category?:
    | "general"
    | "images"
    | "videos"
    | "news"
    | "music"
    | "map"
    | "science"
    | "files"
    | "social_media"
    | "tech"
}

const SearchSkeleton = ({ category = "general" }: SearchSkeletonProps) => {
  if (category === "images") {
    return <SearchSkeletonImages />
  }

  if (category === "videos") {
    return <SearchSkeletonVideos />
  }

  if (category === "news") {
    return <SearchSkeletonNews />
  }

  return <SearchSkeletonGeneral />
}

export default SearchSkeleton
