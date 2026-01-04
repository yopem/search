"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Switch } from "@/components/ui/switch"

interface SettingsSearchResultsProps {
  showInfoboxPanels?: boolean
  onToggleInfoboxPanels: (checked: boolean) => void
  disabled?: boolean
}

const SettingsSearchResults = ({
  showInfoboxPanels,
  onToggleInfoboxPanels,
  disabled,
}: SettingsSearchResultsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Search Results</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Field className="flex flex-row items-center justify-between gap-4">
          <div className="flex-1">
            <FieldLabel>Show infobox panels</FieldLabel>
            <FieldDescription>
              Display information panels with details about entities, people,
              places, and organizations
            </FieldDescription>
          </div>
          <Switch
            checked={showInfoboxPanels ?? true}
            onCheckedChange={onToggleInfoboxPanels}
            disabled={disabled}
          />
        </Field>
      </CardContent>
    </Card>
  )
}

export default SettingsSearchResults
