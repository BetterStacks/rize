import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { Loader2 } from 'lucide-react'

import { cn } from '@/lib/utils'

/*
 * Which variant (see docs/DESIGN-SYSTEM.md):
 * - default      ink fill. The main action in a form or dialog.
 * - brand        Rize yellow, ink text. The one primary action on a screen. Use sparingly.
 * - outline      hairline border on surface. Secondary actions next to a default/brand button.
 * - ghost        no chrome until hover. Toolbars, icon buttons, tertiary actions.
 * - destructive  delete / remove, usually inside a confirm dialog.
 * - link         inline text action.
 * Legacy names still work: secondary (= default), primary and warning (= brand),
 * success (= default).
 */
const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium select-none transition-[color,background-color,border-color,box-shadow,opacity,transform] duration-fast ease-calm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-ground active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-ink text-on-ink hover:bg-ink/90',
        brand: 'bg-brand text-brand-ink hover:brightness-[0.96]',
        outline: 'border border-hairline bg-surface text-ink hover:bg-subtle',
        ghost: 'text-ink hover:bg-subtle',
        destructive: 'bg-danger text-on-ink hover:bg-danger/90',
        link: 'text-ink underline-offset-4 hover:underline',
        // Legacy aliases
        secondary: 'bg-ink text-on-ink hover:bg-ink/90',
        primary: 'bg-brand text-brand-ink hover:brightness-[0.96]',
        success: 'bg-ink text-on-ink hover:bg-ink/90',
        warning: 'bg-brand text-brand-ink hover:brightness-[0.96]',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 px-3 text-xs',
        lg: 'h-12 px-6 text-base',
        xl: 'h-14 px-8 text-base',
        // touch-target (globals.css) gives a 44px hit area on touch screens
        // without changing the visible size
        icon: 'h-10 w-10 touch-target',
        smallIcon: 'size-8 touch-target',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  haptic?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, haptic = true, loading = false, children, onClick, disabled, ...props }, ref) => {
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      // Light haptic tick on phones that support it
      if (haptic && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate?.(1)
      }

      onClick?.(e)
    }

    const classes = cn(buttonVariants({ variant, size, className }))

    if (asChild) {
      return (
        <Slot className={classes} ref={ref} onClick={handleClick} {...props} {...{ disabled }}>
          {children}
        </Slot>
      )
    }

    return (
      <button
        className={classes}
        ref={ref}
        onClick={handleClick}
        disabled={loading || disabled}
        aria-busy={loading || undefined}
        {...props}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            <span className="opacity-70">Loading…</span>
          </span>
        ) : children}
      </button>
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
