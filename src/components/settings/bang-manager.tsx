"use client"

import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  DownloadIcon,
  PlusIcon,
  RefreshCwIcon,
  SearchIcon,
  UploadIcon,
} from "lucide-react"

import BangConfirmDialog from "@/components/settings/bang-confirm-dialog"
import BangFormDialog from "@/components/settings/bang-form-dialog"
import BangImportDialog from "@/components/settings/bang-import-dialog"
import BangItemCard from "@/components/settings/bang-item-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useBangMutations } from "@/hooks/use-bang-mutations"
import { useMergedBangs, type MergedBang } from "@/hooks/use-merged-bangs"
import { queryApi } from "@/lib/orpc/query"

const BangManager = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const [formDialogOpen, setFormDialogOpen] = useState(false)
  const [formDialogMode, setFormDialogMode] = useState<"create" | "edit">(
    "create",
  )
  const [selectedBang, setSelectedBang] = useState<MergedBang | null>(null)
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [confirmDialogMode, setConfirmDialogMode] = useState<
    "delete" | "reset"
  >("delete")
  const [bangToDelete, setBangToDelete] = useState<MergedBang | null>(null)
  const [importDialogOpen, setImportDialogOpen] = useState(false)

  const { data: customBangs = [], isLoading } = useQuery({
    ...queryApi.bangs.list.queryOptions({ input: {} }),
  })

  const { data: userSettings } = useQuery({
    ...queryApi.userSettings.get.queryOptions({ input: {} }),
  })

  const {
    createMutation,
    updateMutation,
    deleteMutation,
    toggleMutation,
    exportMutation,
    importMutation,
    resetMutation,
    disableDefaultMutation,
    enableDefaultMutation,
  } = useBangMutations()

  const disabledDefaultBangs = useMemo(
    () => userSettings?.disabledDefaultBangs ?? [],
    [userSettings],
  )

  const mergedBangs = useMergedBangs(customBangs, disabledDefaultBangs)

  const filteredBangs = useMemo(() => {
    if (!searchQuery) return mergedBangs

    const query = searchQuery.toLowerCase()
    return mergedBangs.filter(
      (bang) =>
        bang.shortcut.toLowerCase().includes(query) ||
        bang.label.toLowerCase().includes(query) ||
        bang.url.toLowerCase().includes(query),
    )
  }, [mergedBangs, searchQuery])

  const customBangsCount = mergedBangs.filter((b) => !b.isDefault).length

  const handleOpenCreateDialog = () => {
    setFormDialogMode("create")
    setSelectedBang(null)
    setFormDialogOpen(true)
  }

  const handleOpenEditDialog = (bang: MergedBang) => {
    setFormDialogMode("edit")
    setSelectedBang(bang)
    setFormDialogOpen(true)
  }

  const handleOpenDeleteDialog = (bang: MergedBang) => {
    setConfirmDialogMode("delete")
    setBangToDelete(bang)
    setConfirmDialogOpen(true)
  }

  const handleOpenResetDialog = () => {
    setConfirmDialogMode("reset")
    setConfirmDialogOpen(true)
  }

  const handleCreate = (data: {
    shortcut: string
    url: string
    label: string
    isSystemOverride: boolean
  }) => {
    createMutation.mutate(data, {
      onSuccess: () => setFormDialogOpen(false),
    })
  }

  const handleUpdate = (data: {
    id: string
    shortcut: string
    url: string
    label: string
    isEnabled: boolean
  }) => {
    updateMutation.mutate(data, {
      onSuccess: () => {
        setFormDialogOpen(false)
        setSelectedBang(null)
      },
    })
  }

  const handleCreateOverride = (data: {
    shortcut: string
    url: string
    label: string
    isSystemOverride: boolean
  }) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        setFormDialogOpen(false)
        setSelectedBang(null)
      },
    })
  }

  const handleDelete = () => {
    if (!bangToDelete) return

    if (bangToDelete.isDefault) {
      disableDefaultMutation.mutate(
        { shortcut: bangToDelete.shortcut },
        {
          onSuccess: () => {
            setConfirmDialogOpen(false)
            setBangToDelete(null)
          },
        },
      )
    } else if (bangToDelete.id) {
      deleteMutation.mutate(
        { id: bangToDelete.id },
        {
          onSuccess: () => {
            setConfirmDialogOpen(false)
            setBangToDelete(null)
          },
        },
      )
    }
  }

  const handleReset = () => {
    resetMutation.mutate(
      {},
      {
        onSuccess: () => setConfirmDialogOpen(false),
      },
    )
  }

  const handleToggle = (bang: MergedBang) => {
    if (bang.isDefault && !bang.id) {
      if (bang.isEnabled) {
        disableDefaultMutation.mutate({ shortcut: bang.shortcut })
      } else {
        enableDefaultMutation.mutate({ shortcut: bang.shortcut })
      }
    } else if (bang.id) {
      toggleMutation.mutate({ id: bang.id, isEnabled: !bang.isEnabled })
    }
  }

  const handleExport = () => {
    exportMutation.mutate({})
  }

  const handleImport = (data: unknown, mode: "skip" | "replace") => {
    const importData = data as {
      version: number
      bangs: {
        shortcut: string
        url: string
        label: string
        isEnabled?: boolean
      }[]
    }
    importMutation.mutate(
      { ...importData, mode },
      {
        onSuccess: () => setImportDialogOpen(false),
      },
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <SearchIcon className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="Search bangs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setImportDialogOpen(true)}>
            <UploadIcon className="mr-2 h-4 w-4" />
            Import
          </Button>

          <Button
            variant="outline"
            onClick={handleExport}
            disabled={exportMutation.isPending}
          >
            <DownloadIcon className="mr-2 h-4 w-4" />
            Export
          </Button>

          <Button onClick={handleOpenCreateDialog}>
            <PlusIcon className="mr-2 h-4 w-4" />
            Add Bang
          </Button>
        </div>
      </div>

      {isLoading && (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">Loading...</p>
          </CardContent>
        </Card>
      )}

      {!isLoading && filteredBangs.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">
              {searchQuery
                ? "No bangs match your search"
                : "No bangs available"}
            </p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {!isLoading &&
          filteredBangs.map((bang) => (
            <BangItemCard
              key={`${bang.shortcut}-${bang.id ?? "default"}`}
              bang={bang}
              onToggle={handleToggle}
              onEdit={handleOpenEditDialog}
              onDelete={handleOpenDeleteDialog}
            />
          ))}
      </div>

      {customBangsCount > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground text-sm">
            {customBangsCount} / 100 custom bangs
          </p>
          <Button variant="outline" onClick={handleOpenResetDialog}>
            <RefreshCwIcon className="mr-2 h-4 w-4" />
            Reset All Custom
          </Button>
        </div>
      )}

      <BangFormDialog
        isOpen={formDialogOpen}
        onClose={() => {
          setFormDialogOpen(false)
          setSelectedBang(null)
        }}
        mode={formDialogMode}
        bang={selectedBang}
        customBangs={customBangs}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
        onCreateOverride={handleCreateOverride}
        isPending={createMutation.isPending || updateMutation.isPending}
      />

      <BangConfirmDialog
        isOpen={confirmDialogOpen}
        onClose={() => {
          setConfirmDialogOpen(false)
          setBangToDelete(null)
        }}
        mode={confirmDialogMode}
        onConfirm={confirmDialogMode === "delete" ? handleDelete : handleReset}
        isPending={
          confirmDialogMode === "delete"
            ? deleteMutation.isPending || disableDefaultMutation.isPending
            : resetMutation.isPending
        }
      />

      <BangImportDialog
        isOpen={importDialogOpen}
        onClose={() => setImportDialogOpen(false)}
        onImport={handleImport}
        isPending={importMutation.isPending}
      />
    </div>
  )
}

export default BangManager
