"use client"

import { forwardRef, useCallback, useEffect, useRef, useState } from "react"
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils/style"

interface CarouselProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  showNavigation?: boolean
}

export function Carousel({
  children,
  className,
  showNavigation = true,
  ...props
}: CarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const checkScrollability = useCallback(() => {
    if (!scrollRef.current) return

    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
    setCanScrollLeft(scrollLeft > 0)
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
  }, [])

  useEffect(() => {
    const scrollElement = scrollRef.current
    if (!scrollElement) return

    checkScrollability()

    const resizeObserver = new ResizeObserver(() => {
      checkScrollability()
    })

    resizeObserver.observe(scrollElement)
    scrollElement.addEventListener("scroll", checkScrollability)

    return () => {
      resizeObserver.disconnect()
      scrollElement.removeEventListener("scroll", checkScrollability)
    }
  }, [checkScrollability])

  const scroll = useCallback((direction: "left" | "right") => {
    if (!scrollRef.current) return

    const scrollAmount = scrollRef.current.clientWidth * 0.8
    const targetScroll =
      scrollRef.current.scrollLeft +
      (direction === "left" ? -scrollAmount : scrollAmount)

    scrollRef.current.scrollTo({
      left: targetScroll,
      behavior: "smooth",
    })
  }, [])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault()
        scroll("left")
      } else if (e.key === "ArrowRight") {
        e.preventDefault()
        scroll("right")
      }
    },
    [scroll],
  )

  return (
    <div className={cn("group relative", className)} {...props}>
      {showNavigation && canScrollLeft && (
        <div className="absolute top-0 bottom-0 left-0 z-10 hidden items-center lg:flex">
          <Button
            variant="outline"
            size="icon"
            className="shadow-lg-soft h-9 w-9 rounded-full"
            onClick={() => scroll("left")}
            aria-label="Previous images"
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </Button>
        </div>
      )}

      <div
        ref={scrollRef}
        className="scrollbar-hide flex gap-3 overflow-x-auto scroll-smooth"
        style={{
          scrollSnapType: "x mandatory",
          WebkitOverflowScrolling: "touch",
        }}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="region"
      >
        {children}
      </div>

      {showNavigation && canScrollRight && (
        <div className="absolute top-0 right-0 bottom-0 z-10 hidden items-center lg:flex">
          <Button
            variant="outline"
            size="icon"
            className="shadow-lg-soft h-9 w-9 rounded-full"
            onClick={() => scroll("right")}
            aria-label="Next images"
          >
            <ChevronRightIcon className="h-4 w-4" />
          </Button>
        </div>
      )}

      <div className="from-background pointer-events-none absolute top-0 bottom-0 left-0 w-8 bg-gradient-to-r opacity-0 transition-opacity group-hover:opacity-100 lg:opacity-0" />
      <div className="from-background pointer-events-none absolute top-0 right-0 bottom-0 w-8 bg-gradient-to-l opacity-0 transition-opacity group-hover:opacity-100 lg:opacity-0" />
    </div>
  )
}

interface CarouselItemProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export const CarouselItem = forwardRef<HTMLDivElement, CarouselItemProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("shrink-0", className)}
        style={{ scrollSnapAlign: "start" }}
        {...props}
      >
        {children}
      </div>
    )
  },
)

CarouselItem.displayName = "CarouselItem"
