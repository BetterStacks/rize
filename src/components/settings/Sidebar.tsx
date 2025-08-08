'use client'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const settingsLinks = [
  { href: '/settings', label: 'Profile', icon: '👤' },
  { href: '/settings/account', label: 'Account', icon: '⚙️' },
  { href: '/settings/privacy', label: 'Privacy', icon: '🔒' },
  { href: '/settings/notifications', label: 'Notifications', icon: '🔔' },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-full max-w-xs px-4 pt-8 h-screen space-y-2">
      {settingsLinks.map((link) => (
        <Button
          key={link.href}
          variant="ghost"
          className={cn(
            'w-full justify-start gap-2 text-left',
            pathname === link.href && 'bg-muted'
          )}
          asChild
        >
          <Link href={link.href}>
            <span>{link.icon}</span>
            {link.label}
          </Link>
        </Button>
      ))}
    </aside>
  )
}
