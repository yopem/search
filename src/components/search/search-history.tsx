"use client"

import { useState } from "react"
import Link from "next/link"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { History, Trash2, X } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { queryApi } from "@/lib/orpc/query"

const SearchHistory = () => {
  const queryClient = useQueryClient()
  const [showClearDialog, setShowClearDialog] = useState(false)

  const { data: history = [] } = useQuery({
    ...queryApi.search.history.list.queryOptions({
      input: {},
    }),
  })

  const deleteMutation = useMutation({
    ...queryApi.search.history.delete.mutationOptions(),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryApi.search.history.list.queryKey(),
      })
    },
  })

  const clearAllMutation = useMutation({
    ...queryApi.search.history.clearAll.mutationOptions(),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryApi.search.history.list.queryKey(),
      })
      setShowClearDialog(false)
    },
  })

  if (history.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <History className="h-4 w-4" />
          Recent Searches
        </CardTitle>
        <Dialog open={showClearDialog} onOpenChange={setShowClearDialog}>
          <DialogTrigger render={<Button variant="ghost" size="sm" />}>
            <Trash2 className="mr-2 h-4 w-4" />
            Clear All
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Clear all search history?</DialogTitle>
              <DialogDescription>
                This will permanently delete all your search history. This
                action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose render={<Button variant="outline" />}>
                Cancel
              </DialogClose>
              <Button
                variant="destructive"
                onClick={() => clearAllMutation.mutate({})}
                disabled={clearAllMutation.isPending}
              >
                {clearAllMutation.isPending ? "Clearing..." : "Clear All"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          <div className="space-y-2">
            {history.map((item) => (
              <div
                key={item.id}
                className="group hover:bg-accent flex items-center justify-between rounded-md border p-3"
              >
                <Link
                  href={`/search?q=${encodeURIComponent(item.query)}&category=${item.category}`}
                  className="flex flex-1 flex-col gap-1"
                >
                  <span className="font-medium">{item.query}</span>
                  <div className="text-muted-foreground flex items-center gap-2 text-xs">
                    <Badge variant="secondary" className="capitalize">
                      {item.category}
                    </Badge>
                    <span>{item.resultCount} results</span>
                    <span>•</span>
                    <span>{new Date(item.timestamp).toLocaleDateString()}</span>
                  </div>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
                  onClick={() => deleteMutation.mutate({ id: item.id })}
                  disabled={deleteMutation.isPending}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

export default SearchHistory
