import { NuqsAdapter } from "nuqs/adapters/next/app"

import ThemeProvider from "@/components/theme/theme-provider"
import { AnchoredToastProvider, ToastProvider } from "@/components/ui/toast"
import { QueryProvider } from "@/lib/query/provider"

const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeProvider>
      <ToastProvider position="top-center">
        <AnchoredToastProvider>
          <QueryProvider>
            <NuqsAdapter>{children}</NuqsAdapter>
          </QueryProvider>
        </AnchoredToastProvider>
      </ToastProvider>
    </ThemeProvider>
  )
}

export default Providers
