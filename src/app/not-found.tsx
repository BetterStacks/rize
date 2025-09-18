'use client'

import Logo from '@/components/logo'
import Link from 'next/link'
import { useTheme } from 'next-themes'
import Image from 'next/image'

export default function NotFound() {
  const { theme } = useTheme()
  
  return (
    <div className="flex flex-col items-center justify-start relative pt-24 h-[96vh] md:h-screen overflow-hidden w-full text-center px-4">
      <Logo className="size-12 md:size-14 rounded-2xl mb-2" />

      <h1 className="text-4xl font-bold text-neutral-800 dark:text-neutral-200 mb-4">
        404
      </h1>
      
      <span className="text-neutral-500 mb-4 dark:text-neutral-400 mt-4 max-w-md">
        The page you're looking for doesn't exist. <br />
        It may have been moved, deleted, or you entered the wrong URL.
      </span>

      <div className="mb-6">
        <Link 
          href="/"
          className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-200"
        >
          ← Back to Home
        </Link>
      </div>

      <div className="w-full flex items-center justify-center absolute -bottom-[4%] md:-bottom-[20%]">
        <div className="aspect-video border border-neutral-300 shadow-2xl dark:border-dark-border rotate-6 max-w-3xl relative overflow-hidden rounded-3xl w-full opacity-50">
          {theme === 'light' ? (
            <Image
              src={'/minimal3.png'}
              alt="404 illustration"
              quality={100}
              className="md:scale-110"
              style={{ objectFit: 'cover' }}
              fill
            />
          ) : (
            <Image
              src={'/minimal2.png'}
              alt="404 illustration"
              quality={100}
              className="md:scale-110"
              style={{ objectFit: 'cover' }}
              fill
            />
          )}
        </div>
      </div>
    </div>
  )
}
