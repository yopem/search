"use client"

import { useRouter } from "next/navigation"
import { ArrowRight as ArrowRightIcon } from "lucide-react"

import ImageCarouselCard from "@/components/search/image-carousel-card"
import { Button } from "@/components/ui/button"
import { Carousel, CarouselItem } from "@/components/ui/carousel"

interface ImageCarouselProps {
  images: {
    title: string
    url: string
    img_src?: string
    thumbnail?: string
    thumbnail_src?: string
    source?: string
  }[]
  query: string
  onImageClick?: (index: number) => void
  initialCount?: number
  expandedCount?: number
}

const ImageCarousel = ({
  images,
  query,
  onImageClick,
  initialCount = 6,
}: ImageCarouselProps) => {
  const router = useRouter()

  const displayedImages = images.slice(0, initialCount)

  const handleViewAll = () => {
    const params = new URLSearchParams()
    params.set("q", query)
    params.set("category", "images")
    params.set("page", "1")
    router.push(`/search?${params.toString()}`)
  }

  return (
    <section
      className="my-6"
      role="region"
      aria-label={`Image carousel for ${query}`}
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Images</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleViewAll}
          className="text-primary hover:text-primary/80 gap-1"
        >
          View all
          <ArrowRightIcon className="h-4 w-4" />
        </Button>
      </div>

      <Carousel showNavigation={true}>
        {displayedImages.map((image, index) => (
          <CarouselItem
            key={index}
            className="h-37.5 w-50 md:h-45 md:w-60"
            style={{ scrollSnapAlign: "start" }}
          >
            <ImageCarouselCard
              image={image}
              onClick={() => onImageClick?.(index)}
            />
          </CarouselItem>
        ))}
      </Carousel>
    </section>
  )
}

export default ImageCarousel
