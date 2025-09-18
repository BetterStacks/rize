'use client'

import { useEffect } from 'react'

/**
 * Hook to fix random scroll issues on dynamic pages
 * Ensures scroll is enabled and restores proper scrolling behavior
 */
export function useScrollFix() {
  useEffect(() => {
    // Ensure body can scroll
    const ensureScrollable = () => {
      const body = document.body
      const html = document.documentElement
      
      // Remove any scroll-blocking styles that might be stuck
      body.style.overflow = ''
      html.style.overflow = ''
      
      // Ensure proper height for scrolling
      if (body.style.height === '100%' || body.style.height === '100vh') {
        body.style.height = ''
      }
      if (html.style.height === '100%' || html.style.height === '100vh') {
        html.style.height = ''
      }
      
      // Remove any scroll-lock classes that might be stuck
      body.classList.remove('overflow-hidden', 'no-scroll')
      html.classList.remove('overflow-hidden', 'no-scroll')
    }

    // Run immediately
    ensureScrollable()
    
    // Run after a short delay to catch async issues
    const timeoutId = setTimeout(ensureScrollable, 100)
    
    // Cleanup
    return () => {
      clearTimeout(timeoutId)
    }
  }, [])

  useEffect(() => {
    // Handle route changes - ensure scroll is restored
    const handleScrollRestore = () => {
      // Reset scroll position if needed
      if (window.scrollY === 0 && document.body.scrollHeight > window.innerHeight) {
        // If we're at top but there's scrollable content, ensure scroll is working
        document.body.style.overflow = ''
        document.documentElement.style.overflow = ''
      }
    }

    // Listen for DOM changes that might affect scroll
    const observer = new MutationObserver(() => {
      handleScrollRestore()
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class']
    })

    return () => {
      observer.disconnect()
    }
  }, [])
}

/**
 * Hook to ensure scroll is working on mount
 * Use this in components that might have scroll issues
 */
export function useEnsureScroll() {
  useEffect(() => {
    // Clean up any Lenis instances that might be interfering
    const cleanupLenis = () => {
      // Check if Lenis is defined on window
      const lenis = (window as any).lenis
      if (lenis && typeof lenis.destroy === 'function') {
        lenis.destroy()
        delete (window as any).lenis
      }
      
      // Also check for any global Lenis instances
      if (typeof window !== 'undefined') {
        const scripts = document.querySelectorAll('script')
        scripts.forEach(script => {
          if (script.textContent?.includes('lenis')) {
            // Reset any transform styles that Lenis might have applied
            document.documentElement.style.transform = ''
            document.body.style.transform = ''
          }
        })
      }
    }

    // Run Lenis cleanup immediately
    cleanupLenis()
    
    const timer = setTimeout(() => {
      // Additional cleanup after timeout
      cleanupLenis()
      
      // Force scroll check
      if (document.body.scrollHeight > window.innerHeight) {
        // There's content to scroll, make sure scrolling works
        const testScroll = window.scrollY
        window.scrollTo(0, testScroll + 1)
        window.scrollTo(0, testScroll)
      }
    }, 200)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    // Additional check for navigation changes
    const handleFocus = () => {
      // Ensure scroll is still working after navigation
      setTimeout(() => {
        document.body.style.overflow = ''
        document.documentElement.style.overflow = ''
        
        // Additional Lenis cleanup on focus
        const lenis = (window as any).lenis
        if (lenis && typeof lenis.destroy === 'function') {
          lenis.destroy()
          delete (window as any).lenis
        }
      }, 100)
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [])
}