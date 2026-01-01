"use client"

import { ExternalLinkIcon, NewspaperIcon } from "lucide-react"

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface NewsResult {
  title: string
  url: string
  content?: string
  publishedDate?: string
  author?: string
}

const NewsResultCard = ({ result }: { result: NewsResult }) => {
  const displayUrl = new URL(result.url).hostname.replace("www.", "")
  const publishedDate = result.publishedDate
    ? new Date(result.publishedDate).toLocaleDateString()
    : null

  return (
    <Card className="hover:bg-accent/50 transition-colors">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 space-y-1">
            <a
              href={result.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group"
            >
              <div className="flex items-center gap-2">
                <NewspaperIcon className="text-muted-foreground h-4 w-4" />
                <CardTitle className="text-base group-hover:underline">
                  {result.title}
                </CardTitle>
              </div>
            </a>
            <div className="text-muted-foreground flex items-center gap-2 text-xs">
              <span>{displayUrl}</span>
              {publishedDate && <span>• {publishedDate}</span>}
              {result.author && <span>• {result.author}</span>}
            </div>
            {result.content && (
              <CardDescription className="text-sm">
                {result.content}
              </CardDescription>
            )}
          </div>
          <ExternalLinkIcon className="text-muted-foreground h-4 w-4" />
        </div>
      </CardHeader>
    </Card>
  )
}

export default NewsResultCard
