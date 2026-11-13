import { cn } from '@/lib/utils'
import { ArrowLeft, ChevronRight, type LucideIcon } from 'lucide-react'
import Link from 'next/link'
import type { ReactNode } from 'react'

/*
 * The settings screens share the profile's look: a serif page title with one
 * plain line under it, then sections split by hairlines with serif titles.
 * Forms sit in one readable column (max 640px).
 */

type SettingsHeaderProps = {
  title: string;
  description: string;
  back?: { href: string; label: string };
  /** Controls at the right of the title (a timeframe switch, say). */
  actions?: ReactNode;
}

export const SettingsHeader = ({ title, description, back, actions }: SettingsHeaderProps) => (
  <header className="pb-8">
    {back && (
      <Link
        href={back.href}
        className="-ml-2 mb-6 inline-flex min-h-11 items-center gap-1.5 rounded-lg px-2 text-sm text-ink-secondary transition-colors duration-fast ease-calm hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
      >
        <ArrowLeft className="size-4" aria-hidden />
        {back.label}
      </Link>
    )}
    <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
      <div className="min-w-0">
        <h1 className="font-instrument text-4xl leading-tight text-ink">{title}</h1>
        <p className="mt-1 text-sm leading-relaxed text-ink-secondary">{description}</p>
      </div>
      {actions && <div className="shrink-0">{actions}</div>}
    </div>
  </header>
)

type SettingsSectionProps = {
  id: string;
  title: string;
  /** One short line under the title. */
  description?: ReactNode;
  /** Quiet actions at the right of the title. */
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}

/** A settings section: hairline on top, serif title, one line of help. */
export const SettingsSection = ({ id, title, description, actions, children, className }: SettingsSectionProps) => (
  <section
    id={id}
    aria-labelledby={`${id}-title`}
    className={cn('scroll-mt-24 border-t border-hairline py-10', className)}
  >
    <div className="mb-6 flex items-start justify-between gap-3">
      <div className="min-w-0">
        <h2 id={`${id}-title`} className="font-instrument text-[28px] leading-none text-ink">
          {title}
        </h2>
        {description && (
          <p className="mt-2 max-w-[60ch] text-sm leading-relaxed text-ink-secondary">{description}</p>
        )}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-1">{actions}</div>}
    </div>
    <div className="max-w-[640px]">{children}</div>
  </section>
)

type SettingsLinkProps = {
  href: string;
  icon: LucideIcon;
  title: string;
  description: string;
}

/** A row that leads to a settings sub-page, styled like the chat's suggestion rows. */
export const SettingsLink = ({ href, icon: Icon, title, description }: SettingsLinkProps) => (
  <li className="border-b border-hairline">
    <Link
      href={href}
      className="-mx-3 flex min-h-11 items-center gap-3 rounded-xl px-3 py-4 transition-colors duration-fast ease-calm hover:bg-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
    >
      <span
        aria-hidden
        className="flex size-9 shrink-0 items-center justify-center rounded-full bg-subtle text-ink-secondary"
      >
        <Icon className="size-[18px]" strokeWidth={1.75} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium text-ink">{title}</span>
        <span className="block text-sm leading-snug text-ink-secondary">{description}</span>
      </span>
      <ChevronRight className="size-4 shrink-0 text-ink-secondary" aria-hidden />
    </Link>
  </li>
)
