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
import { useEffect, useRef, useState } from 'react'

export default function Home() {
  useEffect(() => {
    const lenis = new Lenis()

    function raf(time: number) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }

    requestAnimationFrame(raf)
  }, [])

  const titles = [
    'Designers',
    'Developers',
    'Creators',
    'Founders',
    'Individuals',
  ]

  const [activeTitle, setActiveTitle] = useState(titles[0])

  return (
    <div className="w-full flex flex-col ">
      <div className="max-w-screen-2xl w-full min-h-screen  mx-auto">
        <HeroSection />

        {/* <div className="w-full h-[2000px] bg-red-200 "> */}
        <Join />
        {/* </div> */}
        {/* </section> */}

        {/* <Window /> */}

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
        className="absolute top-0 left-0 right-0 -z-10"
      >
        <path
          className="dark:fill-[#3A0CA3] fill-[#3A0CA3]"
          d="M0 103.452C544.921 -40.2235 861.621 -28.6228 1440 103.452V1008H0V103.452Z"
        />
        <path d="M0 103.452C544.921 -40.2235 861.621 -28.6228 1440 103.452V1008H0V103.452Z" />
      </svg>
      <div
        style={{ zIndex: 1 }}
        className="z-[1] px-6 mt-16   flex flex-col items-center justify-center w-full h-screen"
      >
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-3xl md:text-4xl text-center text-white font-medium tracking-tighter"
        >
          Get Started with <br /> Rize and Grow Your{' '}
          <span className="font-instrument leading-none md:text-5xl font-thin italic">
            Network
          </span>
        </motion.h2>
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mt-4 text-center"
        >
          <span className="text-center  text-neutral-200 leading-tight text-lg font-medium">
            Customize your profile to showcase your unique style and Share{' '}
            <br className="hidden md:block" />
            your thoughts, experiences, and ideas with the world.
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
