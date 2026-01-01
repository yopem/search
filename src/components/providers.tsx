import { NuqsAdapter } from "nuqs/adapters/next/app"

import ThemeProvider from "@/components/theme/theme-provider"
import { QueryProvider } from "@/lib/query/provider"

const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeProvider>
      <QueryProvider>
        <NuqsAdapter>{children}</NuqsAdapter>
      </QueryProvider>
    </ThemeProvider>
  )
}

export default Providers
