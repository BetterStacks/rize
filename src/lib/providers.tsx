'use client'
import DialogContextProvider from '@/components/dialog-provider'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
// Better Auth doesn't need a provider wrapper like NextAuth
import { ThemeProvider } from 'next-themes'
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { ReactNode } from 'react'
import { Toaster } from 'react-hot-toast'
import Context from './context'

export const queryClient = new QueryClient()

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
              <DialogContextProvider>
                <Toaster position="top-right" />
                {children}
              </DialogContextProvider>
            </Context>
          </ThemeProvider>
        </QueryClientProvider>
      </NuqsAdapter>
    </>
  )
}

export default Providers
