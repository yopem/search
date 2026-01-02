"use client"

import { useState } from "react"
import Image from "next/image"
import { ExternalLinkIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface InfoboxPanelMovieProps {
  title: string
  image?: string
  summary?: string
  attributes?: Record<string, unknown>
  source: string
  sourceUrl: string
}

const InfoboxPanelMovie = ({
  title,
  image,
  summary,
  attributes = {},
  source,
  sourceUrl,
}: InfoboxPanelMovieProps) => {
  const [imageError, setImageError] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  const truncatedSummary =
    summary && summary.length > 300 && !isExpanded
      ? summary.slice(0, 300) + "..."
      : summary

  const relevantAttributes = [
    "Director",
    "Release date",
    "Cast",
    "Runtime",
    "Genre",
    "Rating",
  ]

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {image && !imageError && (
          <div className="bg-muted relative mx-auto aspect-[2/3] w-full max-w-[200px] overflow-hidden rounded-md">
            <Image
              src={image}
              alt={title}
              fill
              className="object-cover"
              onError={() => setImageError(true)}
            />
          </div>
        )}
        {truncatedSummary && (
          <div className="text-muted-foreground space-y-2 text-sm">
            <p>{truncatedSummary}</p>
            {summary && summary.length > 300 && (
              <Button
                variant="link"
                size="sm"
                className="h-auto p-0"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? "Show less" : "Read more"}
              </Button>
            )}
          </div>
        )}
        {Object.keys(attributes).length > 0 && (
          <div className="space-y-1.5 text-sm">
            {relevantAttributes
              .filter((key) => attributes[key])
              .map((key) => (
                <div key={key} className="flex gap-2">
                  <span className="text-muted-foreground min-w-[90px] font-medium">
                    {key}:
                  </span>
                  <span className="text-foreground">
                    {String(attributes[key])}
                  </span>
                </div>
              ))}
          </div>
        )}
        <a
          href={sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-xs transition-colors"
        >
          <span>{source}</span>
          <ExternalLinkIcon className="h-3 w-3" />
        </a>
      </CardContent>
    </Card>
  )
}

export default InfoboxPanelMovie
