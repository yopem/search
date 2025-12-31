"use client"

import { useState } from "react"

import Logo from "@/components/logo"
import { SearchAutocomplete } from "@/components/search/search-autocomplete"
import ThemeSwitcher from "@/components/theme/theme-switcher"
import { Button } from "@/components/ui/button"
import { Field } from "@/components/ui/field"

export default function Home() {
  const [query, setQuery] = useState("")

  const handleSubmit = () => {
    if (query.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(query)}`
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-4">
      <div className="absolute top-4 right-4">
        <ThemeSwitcher />
      </div>

      <div className="flex flex-col items-center gap-4">
        <Logo className="h-24 w-auto" />
        <h1 className="text-4xl font-semibold">Yopem</h1>
        <p className="text-muted-foreground max-w-md text-center">
          Search the web without being tracked.
        </p>
      </div>

      <div className="flex w-full max-w-2xl gap-2">
        <Field className="flex-1">
          <SearchAutocomplete
            value={query}
            onChange={setQuery}
            onSubmit={handleSubmit}
          />
        </Field>
        <Button onClick={handleSubmit}>Search</Button>
      </div>
    </div>
  )
}
