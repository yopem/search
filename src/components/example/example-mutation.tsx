"use client"

import { useState } from "react"
import { useForm } from "@tanstack/react-form"
import { useMutation, useQueryClient } from "@tanstack/react-query"

import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Form } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import type { SelectPost } from "@/lib/db/schema/post"
import { clientApi } from "@/lib/orpc/client"

const ExampleMutation = () => {
  const [lastCreatedPost, setLastCreatedPost] = useState<SelectPost | null>(
    null,
  )

  const queryClient = useQueryClient()

  const createPostMutation = useMutation({
    mutationFn: async (data: { title: string; description?: string }) => {
      return await clientApi.example.create({
        title: data.title,
        description: data.description,
        userId: "current-user",
      })
    },
    onSuccess: (data) => {
      void queryClient.invalidateQueries()
      setLastCreatedPost(data)
      form.reset()
    },
    onError: (error) => {
      console.error("Failed to create post:", error)
    },
  })

  const updatePostMutation = useMutation({
    mutationFn: async (data: {
      id: string
      title?: string
      description?: string
    }) => {
      return await clientApi.example.update({
        id: data.id,
        title: data.title,
        description: data.description,
        userId: "current-user",
      })
    },
    onSuccess: (data) => {
      void queryClient.invalidateQueries()
      setLastCreatedPost(data)
    },
    onError: (error) => {
      console.error("Failed to update post:", error)
    },
  })

  const form = useForm({
    defaultValues: {
      title: "",
      description: "",
    },
    onSubmit: ({ value }) => {
      createPostMutation.mutate({
        title: value.title,
        description: value.description || undefined,
      })
    },
  })

  const handleUpdateLastPost = () => {
    if (!lastCreatedPost) return

    updatePostMutation.mutate({
      id: lastCreatedPost.id,
      title: `${lastCreatedPost.title} (Updated)`,
      description: `${lastCreatedPost.description ?? ""} - Updated at ${new Date().toLocaleTimeString()}`,
    })
  }

  return (
    <div className="space-y-6">
      <div className="mx-auto max-w-md">
        <h2 className="mb-4 text-xl font-semibold">Create New Post</h2>

        <Form
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            void form.handleSubmit()
          }}
        >
          <form.Field
            name="title"
            validators={{
              onChange: ({ value }) =>
                !value ? "Title is required" : undefined,
            }}
          >
            {(field) => (
              <Field>
                <FieldLabel>Title *</FieldLabel>
                <Input
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Enter post title..."
                  aria-invalid={field.state.meta.errors.length > 0}
                />
                <FieldError>{field.state.meta.errors.join(", ")}</FieldError>
              </Field>
            )}
          </form.Field>

          <form.Field name="description">
            {(field) => (
              <Field>
                <FieldLabel>Description</FieldLabel>
                <Textarea
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Enter post description (optional)..."
                  rows={3}
                  aria-invalid={field.state.meta.errors.length > 0}
                />
                <FieldError>{field.state.meta.errors.join(", ")}</FieldError>
              </Field>
            )}
          </form.Field>

          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
          >
            {([canSubmit, isSubmitting]) => (
              <Button
                type="submit"
                disabled={
                  !canSubmit || isSubmitting || createPostMutation.isPending
                }
                className="w-full"
              >
                {createPostMutation.isPending ? "Creating..." : "Create Post"}
              </Button>
            )}
          </form.Subscribe>
        </Form>

        {/* Mutation Status */}
        <div className="mt-4 space-y-2">
          {createPostMutation.isError && (
            <div className="rounded-md border border-red-200 bg-red-50 p-3">
              <p className="text-sm text-red-700">
                Error:{" "}
                {createPostMutation.error.message || "Failed to create post"}
              </p>
            </div>
          )}

          {updatePostMutation.isError && (
            <div className="rounded-md border border-red-200 bg-red-50 p-3">
              <p className="text-sm text-red-700">
                Error:{" "}
                {updatePostMutation.error.message || "Failed to update post"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Last Created Post */}
      {lastCreatedPost && (
        <div className="mx-auto max-w-md">
          <h3 className="mb-2 text-lg font-medium">
            Last Created/Updated Post
          </h3>
          <div className="space-y-2 rounded-md border border-green-200 bg-green-50 p-4">
            <div>
              <strong>ID:</strong> {lastCreatedPost.id}
            </div>
            <div>
              <strong>Title:</strong> {lastCreatedPost.title}
            </div>
            {lastCreatedPost.description && (
              <div>
                <strong>Description:</strong> {lastCreatedPost.description}
              </div>
            )}
            <div>
              <strong>Created:</strong>{" "}
              {lastCreatedPost.createdAt
                ? new Date(lastCreatedPost.createdAt).toLocaleString()
                : "N/A"}
            </div>
            <div className="pt-2">
              <Button
                onClick={handleUpdateLastPost}
                disabled={updatePostMutation.isPending}
                variant="outline"
                size="sm"
              >
                {updatePostMutation.isPending
                  ? "Updating..."
                  : "Update This Post"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Mutation Info */}
      <div className="mx-auto max-w-md">
        <h3 className="mb-2 text-lg font-medium">Mutation Status</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Create Status:</span>
            <span
              className={`font-medium ${
                createPostMutation.isPending
                  ? "text-blue-600"
                  : createPostMutation.isError
                    ? "text-red-600"
                    : createPostMutation.isSuccess
                      ? "text-green-600"
                      : "text-gray-500"
              }`}
            >
              {createPostMutation.isPending
                ? "Loading..."
                : createPostMutation.isError
                  ? "Error"
                  : createPostMutation.isSuccess
                    ? "Success"
                    : "Idle"}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Update Status:</span>
            <span
              className={`font-medium ${
                updatePostMutation.isPending
                  ? "text-blue-600"
                  : updatePostMutation.isError
                    ? "text-red-600"
                    : updatePostMutation.isSuccess
                      ? "text-green-600"
                      : "text-gray-500"
              }`}
            >
              {updatePostMutation.isPending
                ? "Loading..."
                : updatePostMutation.isError
                  ? "Error"
                  : updatePostMutation.isSuccess
                    ? "Success"
                    : "Idle"}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ExampleMutation
