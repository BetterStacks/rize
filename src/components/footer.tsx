import Link from 'next/link'

const links = [
  { href: '/privacy', label: 'Privacy' },
  { href: '/terms', label: 'Terms' },
  { href: '/login', label: 'Log in' },
]

// pb-24 below lg leaves room for the fixed mobile bottom nav.
const Footer = () => {
  return (
    <footer className="w-full border-t border-hairline">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 pb-24 pt-10 sm:px-6 md:flex-row md:items-center md:justify-between lg:pb-10">
        <div>
          <p className="font-instrument text-2xl leading-none text-ink">Rize</p>
          <p className="mt-2 text-sm text-ink-secondary">Your story, in your own words.</p>
        </div>
        <nav aria-label="Footer">
          <ul className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="inline-flex min-h-11 items-center text-ink-secondary transition-colors duration-fast ease-calm hover:text-ink"
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li className="text-ink-secondary">&copy; {new Date().getFullYear()} Rize</li>
          </ul>
        </nav>
      </div>
    </footer>
  )
}

export default Footer
