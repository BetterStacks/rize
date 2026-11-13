import Logo from '@/components/logo'
import Link from 'next/link'
import HeaderAuth from './header-auth'

// Landing page header: wordmark, two in-page links, and the sign-in state.
const SiteHeader = () => {
  return (
    <header className="w-full border-b border-hairline">
      <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-ground"
        >
          <Logo className="size-8 rounded-lg" />
          <span className="font-instrument text-2xl leading-none text-ink">Rize</span>
        </Link>
        <nav aria-label="Main" className="flex items-center gap-1 sm:gap-2">
          <a
            href="#how-it-works"
            className="hidden rounded-lg px-3 py-2 text-sm text-ink-secondary transition-colors duration-fast ease-calm hover:text-ink md:inline-flex"
          >
            How it works
          </a>
          <a
            href="#faq"
            className="hidden rounded-lg px-3 py-2 text-sm text-ink-secondary transition-colors duration-fast ease-calm hover:text-ink md:inline-flex"
          >
            FAQ
          </a>
          <HeaderAuth />
        </nav>
      </div>
    </header>
  )
}

export default SiteHeader
