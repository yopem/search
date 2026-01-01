"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import SearchHistory from "@/components/search/search-history"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import { queryApi } from "@/lib/orpc/query"

const SettingsContent = () => {
  const queryClient = useQueryClient()

  const { data: settings, isLoading } = useQuery({
    ...queryApi.userSettings.get.queryOptions({
      input: {},
    }),
  })

  const updateMutation = useMutation({
    ...queryApi.userSettings.update.mutationOptions(),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryApi.userSettings.get.queryKey(),
      })
    },
  })

  const handleToggleSearchHistory = (checked: boolean) => {
    updateMutation.mutate({ showSearchHistory: checked })
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-12 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
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
              checked={settings?.showSearchHistory ?? true}
              onCheckedChange={handleToggleSearchHistory}
              disabled={updateMutation.isPending}
            />
          </Field>

          {settings?.showSearchHistory && (
            <div className="pt-4">
              <SearchHistory />
            </div>
          )}

          {!settings?.showSearchHistory && (
            <div className="text-muted-foreground rounded-md border border-dashed p-4 text-center text-sm">
              <p>Search history is currently disabled</p>
              <p className="mt-1 text-xs">Enable to see your past searches</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default SettingsContent
