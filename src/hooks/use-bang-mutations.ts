"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { toastManager } from "@/components/ui/toast"
import { queryApi } from "@/lib/orpc/query"

export const useBangMutations = () => {
  const queryClient = useQueryClient()

  const invalidateBangQueries = () => {
    void queryClient.invalidateQueries({
      queryKey: queryApi.bangs.list.queryKey(),
    })
    void queryClient.invalidateQueries({
      queryKey: queryApi.bangs.getResolved.queryKey(),
    })
  }

  const invalidateUserSettings = () => {
    void queryClient.invalidateQueries({
      queryKey: queryApi.userSettings.get.queryKey(),
    })
  }

  const createMutation = useMutation({
    ...queryApi.bangs.create.mutationOptions(),
    onSuccess: (_, variables) => {
      invalidateBangQueries()
      toastManager.add({
        title: "Bang created",
        description: `Custom bang !${variables.shortcut} has been created`,
      })
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
      invalidateBangQueries()
      toastManager.add({
        title: "Bang updated",
        description: "Bang has been updated",
      })
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
      invalidateBangQueries()
      toastManager.add({
        title: "Bang deleted",
        description: "Bang has been deleted",
      })
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
      invalidateBangQueries()
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
      invalidateBangQueries()
      toastManager.add({
        title: "Import complete",
        description: `Imported ${data.imported} bangs, skipped ${data.skipped}`,
      })
    },
  })

  const resetMutation = useMutation({
    ...queryApi.bangs.reset.mutationOptions(),
    onSuccess: () => {
      invalidateBangQueries()
      toastManager.add({
        title: "Bangs reset",
        description: "All custom bangs have been deleted",
      })
    },
  })

  const disableDefaultMutation = useMutation({
    ...queryApi.userSettings.disableDefaultBang.mutationOptions(),
    onSuccess: () => {
      invalidateUserSettings()
      invalidateBangQueries()
    },
  })

  const enableDefaultMutation = useMutation({
    ...queryApi.userSettings.enableDefaultBang.mutationOptions(),
    onSuccess: () => {
      invalidateUserSettings()
      invalidateBangQueries()
    },
  })

  return {
    createMutation,
    updateMutation,
    deleteMutation,
    toggleMutation,
    exportMutation,
    importMutation,
    resetMutation,
    disableDefaultMutation,
    enableDefaultMutation,
  }
}
