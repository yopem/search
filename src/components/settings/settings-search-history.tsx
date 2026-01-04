"use client"

import SearchHistory from "@/components/search/search-history"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Switch } from "@/components/ui/switch"

interface SettingsSearchHistoryProps {
  showSearchHistory?: boolean
  onToggleSearchHistory: (checked: boolean) => void
  disabled?: boolean
}

const SettingsSearchHistory = ({
  showSearchHistory,
  onToggleSearchHistory,
  disabled,
}: SettingsSearchHistoryProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Search History</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Field className="flex flex-row items-center justify-between gap-4">
          <div className="flex-1">
            <FieldLabel>Save search history</FieldLabel>
            <FieldDescription>
              Searches you make are saved to help you find things faster
            </FieldDescription>
          </div>
          <Switch
            checked={showSearchHistory ?? true}
            onCheckedChange={onToggleSearchHistory}
            disabled={disabled}
          />
        </Field>

        {showSearchHistory && (
          <div className="pt-4">
            <SearchHistory />
          </div>
        )}

        {!showSearchHistory && (
          <div className="text-muted-foreground rounded-md border border-dashed p-4 text-center text-sm">
            <p>Search history is currently disabled</p>
            <p className="mt-1 text-xs">Enable to see your past searches</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default SettingsSearchHistory
