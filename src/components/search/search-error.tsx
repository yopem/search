"use client"

import { AlertCircleIcon, RefreshCwIcon, WifiOffIcon } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

interface SearchErrorProps {
  message?: string
  error?: Error
  onRetry?: () => void
}

const getErrorDetails = (error?: Error, message?: string) => {
  const errorMessage =
    error?.message ?? message ?? "An unexpected error occurred"

  if (errorMessage.includes("fetch") || errorMessage.includes("network")) {
    return {
      title: "Network Error",
      description:
        "Unable to connect to the search service. Please check your internet connection and try again.",
      icon: WifiOffIcon,
    }
  }

  if (errorMessage.includes("timeout")) {
    return {
      title: "Request Timeout",
      description:
        "The search request took too long. The service might be experiencing high traffic. Please try again.",
      icon: AlertCircleIcon,
    }
  }

  if (errorMessage.includes("unavailable") || errorMessage.includes("503")) {
    return {
      title: "Service Unavailable",
      description:
        "The search service is temporarily unavailable. Please try again in a few moments.",
      icon: AlertCircleIcon,
    }
  }

  return {
    title: "Search Error",
    description: errorMessage,
    icon: AlertCircleIcon,
  }
}

const SearchError = ({ message, error, onRetry }: SearchErrorProps) => {
  const { title, description, icon: Icon } = getErrorDetails(error, message)

  return (
    <Alert variant="error">
      <Icon className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>
        <div className="flex flex-col gap-3">
          <p>{description}</p>
          {onRetry && (
            <div>
              <Button
                variant="outline"
                size="sm"
                onClick={onRetry}
                className="gap-2"
              >
                <RefreshCwIcon className="h-3 w-3" />
                Try Again
              </Button>
            </div>
          )}
        </div>
      </AlertDescription>
    </Alert>
  )
}

export default SearchError
