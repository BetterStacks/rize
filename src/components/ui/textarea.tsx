import * as React from 'react'

import { cn } from '@/lib/utils'

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<'textarea'>
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        'flex min-h-[80px] w-full rounded-xl border border-hairline bg-transparent px-3 py-2 text-base text-ink transition-[border-color,box-shadow] duration-fast ease-calm placeholder:text-ink-secondary focus-visible:outline-none focus-visible:border-ink focus-visible:ring-[3px] focus-visible:ring-brand/50 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm leading-relaxed',
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Textarea.displayName = 'Textarea'

export { Textarea }
