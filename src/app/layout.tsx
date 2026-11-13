import Dialogs from '@/components/dialogs'
import { BottomNav } from '@/components/ui/bottom-nav'
import Providers from '@/lib/providers'
import { PostHogProvider } from '@/lib/PostHogProvider'
import { cn } from '@/lib/utils'
import type { Metadata } from 'next'
import { Instrument_Serif, Inter } from 'next/font/google'
import './globals.css'
import { Suspense } from 'react'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900', '100', '200', '300'],
})

const instrument = Instrument_Serif({
  variable: '--font-instrument',
  subsets: ['latin'],
  weight: ['400'],
})

const siteDescription =
  "Rize calls you for a few minutes, asks about your week and keeps it in a private journal. When something's worth sharing, you get a post made from what you actually said."

// Pages set their own titles; these are the defaults for pages that don't.
export const metadata: Metadata = {
  title: 'Rize',
  description: siteDescription,
  openGraph: {
    title: 'Rize',
    description: siteDescription,
    siteName: 'Rize',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Rize',
    description: siteDescription,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          'bg-light-bg dark:bg-dark-bg antialiased font-inter',
          inter?.variable,
          instrument?.variable
        )}
      >
        <PostHogProvider>
          <Providers>
            <Suspense fallback={null}>
              <Dialogs />
            </Suspense>
            {children}
            <BottomNav />
          </Providers>
        </PostHogProvider>
      </body>
    </html>
  )
}