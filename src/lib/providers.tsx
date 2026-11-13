'use client'
import DialogContextProvider from '@/components/dialog-provider'
import { Toaster } from '@/components/ui/toaster'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
// Better Auth doesn't need a provider wrapper like NextAuth
import { ThemeProvider } from 'next-themes'
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { ReactNode } from 'react'
import Context from './context'
import { PanelProvider } from './panel-context'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      // refetchOnMount: false,
      // refetchInterval: false,
    }
  }
})

const Providers = ({ children }: { children: ReactNode }) => {
  return (
    <>
      <NuqsAdapter>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider
            attribute={'class'}
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Context>
              <PanelProvider>
                <DialogContextProvider>
                  <Toaster />
                  {children}
                </DialogContextProvider>
              </PanelProvider>
            </Context>
          </ThemeProvider>
        </QueryClientProvider>
      </NuqsAdapter>
    </>
  )
}

export default Providers
