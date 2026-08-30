'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { Toaster } from 'sonner'
import { useUI } from '@/features/shell/use-ui'

/** Applies the persisted theme to <html> so Tailwind's `dark:` variants work. */
function ThemeSync() {
  const theme = useUI((s) => s.theme)
  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', theme === 'dark')
  }, [theme])
  return null
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      }),
  )

  return (
    <QueryClientProvider client={client}>
      <ThemeSync />
      {children}
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            borderRadius: '12px',
            fontSize: '13.5px',
          },
        }}
      />
    </QueryClientProvider>
  )
}
