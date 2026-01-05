import { useQuery } from "@tanstack/react-query"

import { clientApi } from "@/lib/orpc/client"

export const useOpenGraphImage = (url: string, enabled = true) => {
  return useQuery({
    queryKey: ["opengraph", url],
    queryFn: async () => {
      const result = await clientApi.search.getOpenGraphImage({ url })
      return result
    },
    enabled,
    staleTime: 1000 * 60 * 60 * 24,
    gcTime: 1000 * 60 * 60 * 24 * 7,
    retry: false,
  })
}
