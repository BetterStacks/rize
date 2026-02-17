import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-white transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:ring-offset-dark-bg dark:focus-visible:ring-purple-400 active:scale-[0.98] select-none',
  {
    variants: {
      variant: {
        default:
          'border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-600 rounded-lg',
        destructive:
          'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 rounded-lg shadow-lg hover:shadow-red-500/25',
        outline:
          'border border-neutral-200 bg-white/80 backdrop-blur-sm hover:bg-white hover:border-neutral-300 dark:border-dark-border dark:bg-dark-bg/80 dark:hover:bg-dark-border/50 rounded-lg',
        secondary:
          'bg-gradient-to-r from-neutral-800 to-neutral-900 text-white dark:from-neutral-100 dark:to-neutral-200 dark:text-black hover:from-neutral-900 hover:to-black dark:hover:from-white dark:hover:to-neutral-100 rounded-lg shadow-lg',
        ghost: 'dark:hover:bg-dark-border/60 hover:bg-neutral-100 rounded-lg backdrop-blur-sm',
        link: 'text-neutral-700 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white underline-offset-4 hover:underline',
        primary:
          'bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600 rounded-lg shadow-lg hover:shadow-purple-500/25',
        success:
          'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 rounded-lg shadow-lg hover:shadow-green-500/25',
        warning:
          'bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600 rounded-lg shadow-lg hover:shadow-yellow-500/25',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 px-3 text-xs',
        lg: 'h-12 px-6 text-base',
        xl: 'h-14 px-8 text-lg',
        icon: 'h-10 w-10',
        smallIcon: 'size-8',
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
  ({ className, variant, size, asChild = false, haptic = true, loading = false, children, onClick, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      // Add haptic feedback for mobile devices
      if (haptic && 'vibrate' in navigator) {
        navigator.vibrate?.(1)
      }

      onClick?.(e)
    }

    const buttonContent = loading ? (
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        <span className="opacity-70">Loading...</span>
      </div>
    ) : children

    if (asChild) {
      return (
        <Slot
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref}
          {...props}
        >
          {buttonContent}
        </Slot>
      )
    }

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        onClick={handleClick}
        disabled={loading || props.disabled}
        {...props}
      >
        {buttonContent}
      </Comp>
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
