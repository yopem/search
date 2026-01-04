"use client"

import { useState } from "react"

import InfoboxAttributeList from "@/components/search/infobox-attribute-list"
import InfoboxImage from "@/components/search/infobox-image"
import InfoboxSource from "@/components/search/infobox-source"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface InfoboxPanelOrganizationProps {
  title: string
  image?: string
  summary?: string
  attributes?: Record<string, unknown>
  source: string
  sourceUrl: string
}

const InfoboxPanelOrganization = ({
  title,
  image,
  summary,
  attributes = {},
  source,
  sourceUrl,
}: InfoboxPanelOrganizationProps) => {
  const [isExpanded, setIsExpanded] = useState(false)

  const truncatedSummary =
    summary && summary.length > 300 && !isExpanded
      ? summary.slice(0, 300) + "..."
      : summary

  const relevantAttributes = [
    "Founded",
    "Headquarters",
    "Industry",
    "CEO",
    "Employees",
    "Website",
  ]

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {image && (
          <InfoboxImage
            src={image}
            alt={title}
            aspectRatio="logo"
            objectFit="contain"
          />
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
        <InfoboxAttributeList
          attributes={attributes}
          relevantKeys={relevantAttributes}
        />
        <InfoboxSource source={source} sourceUrl={sourceUrl} />
      </CardContent>
    </Card>
  )
}

export default InfoboxPanelOrganization
