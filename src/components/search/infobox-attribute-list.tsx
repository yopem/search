"use client"

interface InfoboxAttributeListProps {
  attributes: Record<string, unknown>
  relevantKeys: string[]
}

const InfoboxAttributeList = ({
  attributes,
  relevantKeys,
}: InfoboxAttributeListProps) => {
  const filteredAttributes = relevantKeys.filter((key) => attributes[key])

  if (filteredAttributes.length === 0) return null

  return (
    <div className="space-y-1.5 text-sm">
      {filteredAttributes.map((key) => (
        <div key={key} className="flex gap-2">
          <span className="text-muted-foreground min-w-[80px] font-medium">
            {key}:
          </span>
          <span className="text-foreground">{String(attributes[key])}</span>
        </div>
      ))}
    </div>
  )
}

export default InfoboxAttributeList
