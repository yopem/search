"use client"

import { ExternalLink as ExternalLinkIcon } from "lucide-react"

interface InfoboxSourceProps {
  source: string
  sourceUrl: string
}

const InfoboxSource = ({ source, sourceUrl }: InfoboxSourceProps) => {
  return (
    <a
      href={sourceUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-xs transition-colors"
    >
      <span>{source}</span>
      <ExternalLinkIcon className="h-3 w-3" />
    </a>
  )
}

export default InfoboxSource
