"use client"

import { useMemo, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  DownloadIcon,
  PencilIcon,
  PlusIcon,
  RefreshCwIcon,
  SearchIcon,
  TrashIcon,
  UploadIcon,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { toastManager } from "@/components/ui/toast"
import { queryApi } from "@/lib/orpc/query"
import { DEFAULT_BANGS } from "@/lib/utils/bangs"

interface BangFormData {
  id?: string
  shortcut: string
  url: string
  label: string
  isEnabled?: boolean
  isSystemOverride?: boolean
}

interface MergedBang {
  id?: string
  shortcut: string
  url: string
  label: string
  isEnabled: boolean
  isSystemOverride: boolean
  isDefault: boolean
}

const BangManager = () => {
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false)
  const [selectedBang, setSelectedBang] = useState<MergedBang | null>(null)
  const [bangToDelete, setBangToDelete] = useState<{
    id?: string
    shortcut: string
    isDefault: boolean
  } | null>(null)
  const [formData, setFormData] = useState<BangFormData>({
    shortcut: "",
    url: "",
    label: "",
  })
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importMode, setImportMode] = useState<"skip" | "replace">("skip")

  const { data: customBangs = [], isLoading } = useQuery({
    ...queryApi.bangs.list.queryOptions({ input: {} }),
  })

  const { data: userSettings } = useQuery({
    ...queryApi.userSettings.get.queryOptions({ input: {} }),
  })

  const createMutation = useMutation({
    ...queryApi.bangs.create.mutationOptions(),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryApi.bangs.list.queryKey(),
      })
      void queryClient.invalidateQueries({
        queryKey: queryApi.bangs.getResolved.queryKey(),
      })
      toastManager.add({
        title: "Bang created",
        description: `Custom bang !${formData.shortcut} has been created`,
      })
      setIsAddDialogOpen(false)
      setFormData({ shortcut: "", url: "", label: "" })
    },
    onError: (error) => {
      toastManager.add({
        title: "Failed to create bang",
        description:
          error.message || "An error occurred while creating the bang",
      })
    },
  })

  const updateMutation = useMutation({
    ...queryApi.bangs.update.mutationOptions(),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryApi.bangs.list.queryKey(),
      })
      void queryClient.invalidateQueries({
        queryKey: queryApi.bangs.getResolved.queryKey(),
      })
      toastManager.add({
        title: "Bang updated",
        description: "Bang has been updated",
      })
      setIsEditDialogOpen(false)
      setSelectedBang(null)
    },
    onError: (error) => {
      toastManager.add({
        title: "Failed to update bang",
        description:
          error.message || "An error occurred while updating the bang",
      })
    },
  })

  const deleteMutation = useMutation({
    ...queryApi.bangs.delete.mutationOptions(),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryApi.bangs.list.queryKey(),
      })
      void queryClient.invalidateQueries({
        queryKey: queryApi.bangs.getResolved.queryKey(),
      })
      toastManager.add({
        title: "Bang deleted",
        description: "Bang has been deleted",
      })
      setIsDeleteDialogOpen(false)
      setBangToDelete(null)
    },
    onError: (error) => {
      toastManager.add({
        title: "Failed to delete bang",
        description:
          error.message || "An error occurred while deleting the bang",
      })
    },
  })

  const toggleMutation = useMutation({
    ...queryApi.bangs.toggle.mutationOptions(),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryApi.bangs.list.queryKey(),
      })
      void queryClient.invalidateQueries({
        queryKey: queryApi.bangs.getResolved.queryKey(),
      })
    },
  })

  const exportMutation = useMutation({
    ...queryApi.bangs.export.mutationOptions(),
    onSuccess: (data) => {
      const json = JSON.stringify(data, null, 2)
      const blob = new Blob([json], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `bangs-export-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toastManager.add({
        title: "Bangs exported",
        description: "Your bangs have been exported successfully",
      })
    },
  })

  const importMutation = useMutation({
    ...queryApi.bangs.import.mutationOptions(),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({
        queryKey: queryApi.bangs.list.queryKey(),
      })
      void queryClient.invalidateQueries({
        queryKey: queryApi.bangs.getResolved.queryKey(),
      })
      toastManager.add({
        title: "Import complete",
        description: `Imported ${data.imported} bangs, skipped ${data.skipped}`,
      })
      setIsImportDialogOpen(false)
      setImportFile(null)
    },
  })

  const resetMutation = useMutation({
    ...queryApi.bangs.reset.mutationOptions(),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryApi.bangs.list.queryKey(),
      })
      void queryClient.invalidateQueries({
        queryKey: queryApi.bangs.getResolved.queryKey(),
      })
      toastManager.add({
        title: "Bangs reset",
        description: "All custom bangs have been deleted",
      })
      setIsResetDialogOpen(false)
    },
  })

  const disableDefaultMutation = useMutation({
    ...queryApi.userSettings.disableDefaultBang.mutationOptions(),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryApi.userSettings.get.queryKey(),
      })
      void queryClient.invalidateQueries({
        queryKey: queryApi.bangs.getResolved.queryKey(),
      })
    },
  })

  const enableDefaultMutation = useMutation({
    ...queryApi.userSettings.enableDefaultBang.mutationOptions(),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryApi.userSettings.get.queryKey(),
      })
      void queryClient.invalidateQueries({
        queryKey: queryApi.bangs.getResolved.queryKey(),
      })
    },
  })

  const disabledDefaultBangs = useMemo(
    () => userSettings?.disabledDefaultBangs ?? [],
    [userSettings],
  )

  const mergedBangs = useMemo(() => {
    const bangsMap = new Map<string, MergedBang>()

    customBangs.forEach((bang) => {
      bangsMap.set(bang.shortcut.toLowerCase(), {
        id: bang.id,
        shortcut: bang.shortcut,
        url: bang.url,
        label: bang.label,
        isEnabled: bang.isEnabled,
        isSystemOverride: bang.isSystemOverride,
        isDefault: false,
      })
    })

    DEFAULT_BANGS.forEach((bang) => {
      const shortcut = bang.shortcut.toLowerCase()
      if (!bangsMap.has(shortcut)) {
        bangsMap.set(shortcut, {
          shortcut: bang.shortcut,
          url: bang.url,
          label: bang.label,
          isEnabled: !disabledDefaultBangs.includes(bang.shortcut),
          isSystemOverride: false,
          isDefault: true,
        })
      }
    })

    return Array.from(bangsMap.values()).sort((a, b) => {
      if (a.isDefault !== b.isDefault) {
        return a.isDefault ? 1 : -1
      }
      return a.shortcut.localeCompare(b.shortcut)
    })
  }, [customBangs, disabledDefaultBangs])

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

  const handleCreate = () => {
    const normalizedShortcut = formData.shortcut.toLowerCase().trim()
    const defaultBangExists = DEFAULT_BANGS.some(
      (b) => b.shortcut.toLowerCase() === normalizedShortcut,
    )

    if (defaultBangExists) {
      setIsAddDialogOpen(false)
      setTimeout(() => {
        toastManager.add({
          title: "Default bang exists",
          description: `A default bang with shortcut "${normalizedShortcut}" already exists. Edit the default bang to create an override instead.`,
        })
      }, 100)
      return
    }

    const customBangExists = customBangs.some(
      (b) => b.shortcut.toLowerCase() === normalizedShortcut,
    )

    if (customBangExists) {
      setIsAddDialogOpen(false)
      setTimeout(() => {
        toastManager.add({
          title: "Bang already exists",
          description: `A custom bang with shortcut "${normalizedShortcut}" already exists.`,
        })
      }, 100)
      return
    }

    createMutation.mutate({
      shortcut: formData.shortcut.trim(),
      url: formData.url.trim(),
      label: formData.label.trim(),
      isSystemOverride: false,
    })
  }

  const handleUpdate = () => {
    if (!selectedBang) return

    if (selectedBang.isDefault && !selectedBang.id) {
      createMutation.mutate({
        shortcut: selectedBang.shortcut.trim(),
        url: selectedBang.url.trim(),
        label: selectedBang.label.trim(),
        isSystemOverride: true,
      })
      setIsEditDialogOpen(false)
      setSelectedBang(null)
    } else if (selectedBang.id) {
      updateMutation.mutate({
        id: selectedBang.id,
        shortcut: selectedBang.shortcut.trim(),
        url: selectedBang.url.trim(),
        label: selectedBang.label.trim(),
        isEnabled: selectedBang.isEnabled,
      })
    }
  }

  const handleDelete = () => {
    if (!bangToDelete) return

    if (bangToDelete.isDefault) {
      disableDefaultMutation.mutate({ shortcut: bangToDelete.shortcut })
      setIsDeleteDialogOpen(false)
      setBangToDelete(null)
    } else if (bangToDelete.id) {
      deleteMutation.mutate({ id: bangToDelete.id })
    }
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

  const handleImport = async () => {
    if (!importFile) return

    try {
      const text = await importFile.text()
      const data = JSON.parse(text)
      importMutation.mutate({ ...data, mode: importMode })
    } catch {
      toastManager.add({
        title: "Invalid file",
        description: "The selected file is not a valid JSON file",
      })
    }
  }

  const handleReset = () => {
    resetMutation.mutate({})
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
          <Dialog
            open={isImportDialogOpen}
            onOpenChange={setIsImportDialogOpen}
          >
            <DialogTrigger
              render={
                <Button variant="outline">
                  <UploadIcon className="mr-2 h-4 w-4" />
                  Import
                </Button>
              }
            />
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Import Bangs</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 px-6 pb-4">
                <Field>
                  <FieldLabel>JSON File</FieldLabel>
                  <Input
                    type="file"
                    accept=".json"
                    onChange={(e) => setImportFile(e.target.files?.[0] ?? null)}
                  />
                </Field>
                <Field>
                  <FieldLabel>Import Mode</FieldLabel>
                  <div className="flex gap-2">
                    <Button
                      variant={importMode === "skip" ? "default" : "outline"}
                      onClick={() => setImportMode("skip")}
                    >
                      Skip Duplicates
                    </Button>
                    <Button
                      variant={importMode === "replace" ? "default" : "outline"}
                      onClick={() => setImportMode("replace")}
                    >
                      Replace Duplicates
                    </Button>
                  </div>
                </Field>
              </div>
              <DialogFooter>
                <DialogClose
                  render={<Button variant="outline">Cancel</Button>}
                />
                <Button
                  onClick={handleImport}
                  disabled={!importFile || importMutation.isPending}
                >
                  Import
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button
            variant="outline"
            onClick={handleExport}
            disabled={exportMutation.isPending}
          >
            <DownloadIcon className="mr-2 h-4 w-4" />
            Export
          </Button>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger
              render={
                <Button>
                  <PlusIcon className="mr-2 h-4 w-4" />
                  Add Bang
                </Button>
              }
            />
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Custom Bang</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 px-6 pb-4">
                <Field>
                  <FieldLabel>Shortcut</FieldLabel>
                  <FieldDescription>
                    Alphanumeric characters only (e.g., gh, mw, mysite)
                  </FieldDescription>
                  <Input
                    placeholder="gh"
                    value={formData.shortcut}
                    onChange={(e) =>
                      setFormData({ ...formData, shortcut: e.target.value })
                    }
                  />
                </Field>
                <Field>
                  <FieldLabel>Label</FieldLabel>
                  <Input
                    placeholder="GitHub"
                    value={formData.label}
                    onChange={(e) =>
                      setFormData({ ...formData, label: e.target.value })
                    }
                  />
                </Field>
                <Field>
                  <FieldLabel>URL</FieldLabel>
                  <FieldDescription>
                    Include {"{query}"} where the search term should go
                  </FieldDescription>
                  <Input
                    placeholder="https://github.com/search?q={query}"
                    value={formData.url}
                    onChange={(e) =>
                      setFormData({ ...formData, url: e.target.value })
                    }
                  />
                </Field>
              </div>
              <DialogFooter>
                <DialogClose
                  render={<Button variant="outline">Cancel</Button>}
                />
                <Button
                  onClick={handleCreate}
                  disabled={
                    !formData.shortcut ||
                    !formData.url ||
                    !formData.label ||
                    createMutation.isPending
                  }
                >
                  Create
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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
            <Card key={`${bang.shortcut}-${bang.id ?? "default"}`}>
              <CardContent className="flex items-center justify-between gap-4 p-4">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <code className="bg-muted rounded px-2 py-1 font-mono text-sm">
                      !{bang.shortcut}
                    </code>
                    <span className="font-medium">{bang.label}</span>
                    {!bang.isEnabled && (
                      <Badge variant="outline">Disabled</Badge>
                    )}
                    {bang.isSystemOverride && (
                      <Badge variant="outline">Custom</Badge>
                    )}
                    {bang.isDefault && !bang.isSystemOverride && (
                      <Badge variant="outline">Default</Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground truncate text-sm">
                    {bang.url}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={bang.isEnabled}
                    onCheckedChange={() => handleToggle(bang)}
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      setSelectedBang(bang)
                      setIsEditDialogOpen(true)
                    }}
                  >
                    <PencilIcon className="h-4 w-4" />
                  </Button>
                  {!bang.isDefault && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        setBangToDelete({
                          id: bang.id,
                          shortcut: bang.shortcut,
                          isDefault: bang.isDefault,
                        })
                        setIsDeleteDialogOpen(true)
                      }}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
      </div>

      {customBangsCount > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground text-sm">
            {customBangsCount} / 100 custom bangs
          </p>
          <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
            <DialogTrigger
              render={
                <Button variant="outline">
                  <RefreshCwIcon className="mr-2 h-4 w-4" />
                  Reset All Custom
                </Button>
              }
            />
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Reset All Custom Bangs</DialogTitle>
              </DialogHeader>
              <p className="px-6 pb-4">
                This will delete all your custom bangs. This action cannot be
                undone.
              </p>
              <DialogFooter>
                <DialogClose
                  render={<Button variant="outline">Cancel</Button>}
                />
                <Button
                  variant="destructive"
                  onClick={handleReset}
                  disabled={resetMutation.isPending}
                >
                  Reset All
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedBang && selectedBang.isDefault && !selectedBang.id
                ? "Customize Default Bang"
                : "Edit Bang"}
            </DialogTitle>
          </DialogHeader>
          {selectedBang && (
            <div className="space-y-4 px-6 pb-4">
              {selectedBang.isDefault && !selectedBang.id && (
                <p className="text-muted-foreground text-sm">
                  Editing a default bang will create a custom override that
                  takes precedence over the default.
                </p>
              )}
              <Field>
                <FieldLabel>Shortcut</FieldLabel>
                <Input
                  value={selectedBang.shortcut}
                  onChange={(e) =>
                    setSelectedBang({
                      ...selectedBang,
                      shortcut: e.target.value,
                    })
                  }
                  disabled={selectedBang.isDefault && !selectedBang.id}
                />
              </Field>
              <Field>
                <FieldLabel>Label</FieldLabel>
                <Input
                  value={selectedBang.label}
                  onChange={(e) =>
                    setSelectedBang({ ...selectedBang, label: e.target.value })
                  }
                />
              </Field>
              <Field>
                <FieldLabel>URL</FieldLabel>
                <Input
                  value={selectedBang.url}
                  onChange={(e) =>
                    setSelectedBang({ ...selectedBang, url: e.target.value })
                  }
                />
              </Field>
            </div>
          )}
          <DialogFooter>
            <DialogClose render={<Button variant="outline">Cancel</Button>} />
            <Button
              onClick={handleUpdate}
              disabled={updateMutation.isPending || createMutation.isPending}
            >
              {selectedBang && selectedBang.isDefault && !selectedBang.id
                ? "Create Override"
                : "Update"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Bang</DialogTitle>
          </DialogHeader>
          <p className="px-6 pb-4">
            Are you sure you want to delete this bang? This action cannot be
            undone.
          </p>
          <DialogFooter>
            <DialogClose render={<Button variant="outline">Cancel</Button>} />
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default BangManager
