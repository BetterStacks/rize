import HomePage from '@/components/home/home-page'
import type { Metadata } from 'next'

const title = 'Rize: your story, in your own words'
const description =
  "Rize calls you, asks one good question about your week and keeps what you say in a private journal. When something's worth sharing, you get a post made from your own words."

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    siteName: 'Rize',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title,
    description,
  },
}

export default function Page() {
  return <HomePage />
}
