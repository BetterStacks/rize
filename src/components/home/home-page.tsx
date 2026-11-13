'use client'

import ClaimUsernameForm from '@/components/claim-username'
import Footer from '@/components/footer'
import BentoGrid from '@/components/home/bento-grid'
import FAQSection from '@/components/home/faq'
import HeroSection from '@/components/home/hero'
import TextReveal from '@/components/home/text-reveal'
import UserReviews from '@/components/home/user-reviews'
import Join from '@/components/join'
import { setCookie } from 'cookies-next'
import { motion } from 'framer-motion'
import Lenis from 'lenis'
import { useRouter } from 'next/navigation'
import { useEffect, useRef } from 'react'

export default function HomePage() {
  useEffect(() => {
    const lenis = new Lenis()

      // Store lenis instance globally for cleanup
      ; (window as any).lenis = lenis

    function raf(time: number) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }

    const rafId = requestAnimationFrame(raf)

    // Cleanup function
    return () => {
      cancelAnimationFrame(rafId)
      lenis.destroy()
      delete (window as any).lenis
    }
  }, [])


  return (
    <div className="relative isolate w-full flex flex-col bg-ground text-ink">
      {/* Soft warm washes in the brand yellow behind the whole page (decorative). */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden [background:radial-gradient(70%_38%_at_50%_0%,rgba(255,217,54,0.30),transparent_70%),radial-gradient(45%_28%_at_0%_30%,rgba(255,176,102,0.18),transparent_70%),radial-gradient(50%_30%_at_100%_55%,rgba(255,217,54,0.18),transparent_70%),radial-gradient(45%_25%_at_10%_80%,rgba(255,196,140,0.16),transparent_70%),radial-gradient(70%_30%_at_50%_100%,rgba(255,217,54,0.24),transparent_70%)] dark:[background:radial-gradient(70%_38%_at_50%_0%,rgba(255,217,54,0.16),transparent_70%),radial-gradient(45%_28%_at_0%_30%,rgba(255,150,80,0.12),transparent_70%),radial-gradient(50%_30%_at_100%_55%,rgba(255,217,54,0.10),transparent_70%),radial-gradient(45%_25%_at_10%_80%,rgba(255,150,80,0.10),transparent_70%),radial-gradient(70%_30%_at_50%_100%,rgba(255,217,54,0.14),transparent_70%),linear-gradient(180deg,#221d17_0%,#1a1612_50%,#201b15_100%)]"
      />
      <div className="max-w-screen-2xl w-full min-h-screen  mx-auto">
        <HeroSection />
        <Join />
        <TextReveal />
        <BentoGrid />
        <UserReviews />
        <FAQSection />
      </div>
      <ClaimUsernameSection />
    </div>
  )
}

const ClaimUsernameSection = () => {
  const ref = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const handleSubmit = (data: string) => {
    setCookie('username', data)
    router.push('/signup')
  }
  return (
    <section
      ref={ref}
      className="relative flex flex-col items-center overflow-hidden justify-center w-full h-[600px] z-10"
    >
      <svg
        width="100%"
        height="600px"
        viewBox="0 0 1440 1008"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        aria-hidden="true"
        className="absolute top-0 left-0 right-0 -z-10"
      >
        {/* A calm wave in the quiet "subtle" tone, edged with a hairline */}
        <path
          className="fill-subtle stroke-hairline"
          strokeWidth={2}
          vectorEffect="non-scaling-stroke"
          d="M0 103.452C544.921 -40.2235 861.621 -28.6228 1440 103.452V1008H0V103.452Z"
        />
      </svg>
      <div
        style={{ zIndex: 1 }}
        className="z-[1] px-6 mt-16   flex flex-col items-center justify-center w-full h-screen"
      >
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="font-instrument text-4xl md:text-6xl text-center text-ink leading-[1.05]"
        >
          Your story starts <br /> with{' '}
          <span className="italic">your name</span>
        </motion.h2>
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mt-4 text-center"
        >
          <span className="text-center text-ink-secondary leading-snug text-base md:text-lg">
            Claim your rize.so link, take a short call and read it back in your
            journal. <br className="hidden md:block" />
            Nothing goes public unless you choose to share it.
          </span>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-row mt-6 items-center justify-center"
        >
          <ClaimUsernameForm onSubmit={handleSubmit} />
        </motion.div>
      </div>
      <Footer />
    </section>
  )
}
