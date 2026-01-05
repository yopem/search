"use client"

import ImageCarousel from "@/components/search/image-carousel"
import ImageResultCard from "@/components/search/image-result-card"
import NewsResultCard from "@/components/search/news-result-card"
import VideoResultCard from "@/components/search/video-result-card"
import WebResultCard from "@/components/search/web-result-card"

interface SearchResult {
  title: string
  url: string
  content?: string
  img_src?: string
  thumbnail?: string
  thumbnail_src?: string
  publishedDate?: string
  author?: string
  iframe_src?: string
  duration?: string
  engine?: string
  resolution?: string
  img_format?: string
  source?: string
}

interface PageData {
  results: SearchResult[]
  infobox?: {
    type: string
    title: string
    image?: string
    summary?: string
    attributes?: Record<string, string>
    source?: string
    sourceUrl?: string
  }
}

interface SearchResultsListProps {
  category: string
  pages: PageData[]
  carouselImages?: SearchResult[]
  isLoadingImages?: boolean
  initialQuery: string
  openInNewTab?: boolean
  onImageClick: (index: number) => void
  onCarouselImageClick: (index: number) => void
}

const SearchResultsList = ({
  category,
  pages,
  carouselImages,
  isLoadingImages,
  initialQuery,
  openInNewTab = true,
  onImageClick,
  onCarouselImageClick,
}: SearchResultsListProps) => {
  const allResults = pages.flatMap((page) => page.results)

  return (
    <div role="feed" aria-label={`Search results for ${initialQuery}`}>
      {category === "general" &&
        pages.map((pageData, pageIndex) => (
          <div
            key={pageIndex}
            data-page={pageIndex + 1}
            className="mb-4 space-y-4 last:mb-0"
          >
            {pageData.results.map(
              (result: SearchResult, resultIndex: number) => {
                const globalIndex =
                  pageIndex * (pages[0]?.results.length || 10) + resultIndex
                const shouldShowCarousel =
                  pageIndex === 0 &&
                  resultIndex === 2 &&
                  carouselImages &&
                  carouselImages.length >= 6

                return (
                  <div key={globalIndex}>
                    <article
                      aria-posinset={globalIndex + 1}
                      aria-setsize={allResults.length}
                    >
                      <WebResultCard
                        result={result}
                        openInNewTab={openInNewTab}
                      />
                    </article>
                    {pageIndex === 0 &&
                      resultIndex === 2 &&
                      (isLoadingImages ? (
                        <div className="my-4 flex gap-2 overflow-hidden">
                          {Array.from({ length: 6 }).map((_, i) => (
                            <div
                              key={i}
                              className="bg-muted h-32 w-48 flex-shrink-0 animate-pulse rounded-lg"
                            />
                          ))}
                        </div>
                      ) : (
                        shouldShowCarousel && (
                          <ImageCarousel
                            images={carouselImages}
                            query={initialQuery}
                            onImageClick={onCarouselImageClick}
                          />
                        )
                      ))}
                  </div>
                )
              },
            )}
          </div>
        ))}

      {category === "images" &&
        pages.map((pageData, pageIndex) => (
          <div
            key={pageIndex}
            data-page={pageIndex + 1}
            className="mb-2 flex flex-wrap gap-2 after:flex-auto after:content-[''] last:mb-0"
          >
            {pageData.results.map(
              (result: SearchResult, resultIndex: number) => {
                const globalIndex =
                  pageIndex * (pages[0]?.results.length || 10) + resultIndex
                return (
                  <ImageResultCard
                    key={globalIndex}
                    result={result}
                    onImageClick={() => onImageClick(globalIndex)}
                    priority={globalIndex < 6}
                  />
                )
              },
            )}
          </div>
        ))}

      {category === "videos" &&
        pages.map((pageData, pageIndex) => (
          <div
            key={pageIndex}
            data-page={pageIndex + 1}
            className="mb-4 space-y-4 last:mb-0"
          >
            {pageData.results.map(
              (result: SearchResult, resultIndex: number) => {
                const globalIndex =
                  pageIndex * (pages[0]?.results.length || 10) + resultIndex
                return (
                  <article
                    key={globalIndex}
                    aria-posinset={globalIndex + 1}
                    aria-setsize={allResults.length}
                  >
                    <VideoResultCard
                      result={result}
                      openInNewTab={openInNewTab}
                    />
                  </article>
                )
              },
            )}
          </div>
        ))}

      {category === "news" &&
        pages.map((pageData, pageIndex) => (
          <div
            key={pageIndex}
            data-page={pageIndex + 1}
            className="mb-4 space-y-4 last:mb-0"
          >
            {pageData.results.map(
              (result: SearchResult, resultIndex: number) => {
                const globalIndex =
                  pageIndex * (pages[0]?.results.length || 10) + resultIndex
                return (
                  <article
                    key={globalIndex}
                    aria-posinset={globalIndex + 1}
                    aria-setsize={allResults.length}
                  >
                    <NewsResultCard
                      result={result}
                      openInNewTab={openInNewTab}
                    />
                  </article>
                )
              },
            )}
          </div>
        ))}

      {(category === "music" ||
        category === "map" ||
        category === "science" ||
        category === "files" ||
        category === "social_media" ||
        category === "tech") &&
        pages.map((pageData, pageIndex) => (
          <div
            key={pageIndex}
            data-page={pageIndex + 1}
            className="mb-4 space-y-4 last:mb-0"
          >
            {pageData.results.map(
              (result: SearchResult, resultIndex: number) => {
                const globalIndex =
                  pageIndex * (pages[0]?.results.length || 10) + resultIndex
                return (
                  <article
                    key={globalIndex}
                    aria-posinset={globalIndex + 1}
                    aria-setsize={allResults.length}
                  >
                    <WebResultCard
                      result={result}
                      openInNewTab={openInNewTab}
                    />
                  </article>
                )
              },
            )}
          </div>
        ))}
    </div>
  )
}

export default SearchResultsList
