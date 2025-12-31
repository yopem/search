import { Search } from "lucide-react"

import Logo from "@/components/logo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-4">
      <div className="flex flex-col items-center gap-4">
        <Logo className="h-24 w-auto" />
        <h1 className="text-4xl font-semibold">Yopem</h1>
        <p className="text-muted-foreground max-w-md text-center">
          Search the web without being tracked.
        </p>
      </div>

      <form
        action="/search"
        method="get"
        className="flex w-full max-w-2xl gap-2"
      >
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            type="text"
            name="q"
            placeholder="Search the web..."
            className="pl-10"
            autoFocus
            required
          />
        </div>
        <Button type="submit">Search</Button>
      </form>
    </div>
  )
}
