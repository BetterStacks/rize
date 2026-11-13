'use client'

import { AlertCircle, Check, Loader2 } from 'lucide-react'
import { useSyncExternalStore } from 'react'
import {
  resolveValue,
  toast as hotToast,
  Toaster as HotToaster,
  type Toast,
} from 'react-hot-toast'

import { useBottomNavVisibility } from '@/components/ui/bottom-nav'
import { cn } from '@/lib/utils'

/*
 * The app's one toast surface. Call sites keep using `toast` from
 * react-hot-toast (toast.success / toast.error / toast.loading / toast.promise);
 * this only changes how those toasts look and where they appear.
 *
 * Phones and tablets (below lg, where the bottom nav shows): bottom-centre,
 * above the nav. Desktop: bottom-right.
 */

const DESKTOP_QUERY = '(min-width: 1024px)'

function subscribe(onChange: () => void) {
  const mql = window.matchMedia(DESKTOP_QUERY)
  mql.addEventListener('change', onChange)
  return () => mql.removeEventListener('change', onChange)
}

function useIsDesktop() {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(DESKTOP_QUERY).matches,
    () => false
  )
}

function ToastIcon({ t }: { t: Toast }) {
  if (t.icon) return <span className="flex size-5 shrink-0 items-center justify-center">{t.icon}</span>

  const icon =
    t.type === 'success' ? (
      <Check className="size-4 text-success" strokeWidth={2.25} />
    ) : t.type === 'error' ? (
      <AlertCircle className="size-4 text-danger" strokeWidth={2} />
    ) : t.type === 'loading' ? (
      <Loader2 className="size-4 animate-spin text-ink-secondary" strokeWidth={2} />
    ) : null

  if (!icon) return null

  return (
    // Keyed by type so a loading toast that becomes success/error swaps its icon with a small fade.
    <span
      key={t.type}
      aria-hidden="true"
      className="flex size-5 shrink-0 items-center justify-center animate-in fade-in-0 zoom-in-75 duration-200"
    >
      {icon}
    </span>
  )
}

function ToastCard({ t }: { t: Toast }) {
  const message = resolveValue(t.message, t)

  if (t.type === 'custom') return <>{message}</>

  return (
    <div
      {...t.ariaProps}
      onClick={() => hotToast.dismiss(t.id)}
      className={cn(
        'pointer-events-auto flex w-max max-w-[min(380px,calc(100vw-32px))] cursor-pointer items-start gap-2.5 rounded-xl border border-hairline bg-surface px-3.5 py-3 font-inter text-sm leading-5 text-ink shadow-float',
        'duration-200 ease-calm',
        t.visible
          ? 'animate-in fade-in-0 slide-in-from-bottom-2'
          : 'animate-out fade-out-0 slide-out-to-bottom-1 fill-mode-forwards',
        t.className
      )}
      style={t.style}
    >
      <ToastIcon t={t} />
      <div className="min-w-0 break-words [&>*]:m-0">{message}</div>
    </div>
  )
}

export function Toaster() {
  const isDesktop = useIsDesktop()
  const bottomNavShown = useBottomNavVisibility()

  // Clear the bottom nav (about 76px tall) and the phone home indicator.
  const mobileBottom =
    bottomNavShown ? 'calc(88px + env(safe-area-inset-bottom))' : 'calc(16px + env(safe-area-inset-bottom))'

  return (
    <HotToaster
      position={isDesktop ? 'bottom-right' : 'bottom-center'}
      gutter={8}
      containerStyle={isDesktop ? { bottom: 24, right: 24 } : { bottom: mobileBottom, left: 16, right: 16 }}
      toastOptions={{
        success: { duration: 3000 },
        error: { duration: 5000 },
      }}
    >
      {(t) => <ToastCard t={t} />}
    </HotToaster>
  )
}
