import Footer from '@/components/footer'
import FAQSection from '@/components/home/faq'
import HeroSection from '@/components/home/hero'
import HowItWorks from '@/components/home/how-it-works'
import SiteHeader from '@/components/home/site-header'
import TrustSection from '@/components/home/trust'
import YourProfile from '@/components/home/your-profile'
import YourWords from '@/components/home/your-words'
import Join from '@/components/join'
import type { Metadata } from 'next'

const title = 'Rize: your story, in your own words'
const description =
  "Rize calls you for a few minutes, asks about your week and keeps it in a private journal. When something's worth sharing, you get a post made from what you actually said."

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

export default function Home() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-ground text-ink">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-surface focus:px-4 focus:py-2 focus:text-sm focus:shadow-float"
      >
        Skip to content
      </a>
      <SiteHeader />
      <main id="main" className="w-full flex-1">
        <HeroSection />
        <HowItWorks />
        <YourWords />
        <YourProfile />
        <TrustSection />
        <FAQSection />
        <Join />
      </main>
      <Footer />
    </div>
  )
}
