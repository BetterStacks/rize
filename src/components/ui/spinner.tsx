import { LoaderIcon } from 'lucide-react'
import { forwardRef } from 'react'

import { cn } from '@/lib/utils'

interface SpinnerProps extends Omit<React.ComponentProps<'svg'>, 'ref'> {
  className?: string
}

const Spinner = forwardRef<SVGSVGElement, SpinnerProps>(
  ({ className, ...props }, ref) => {
    return (
      <LoaderIcon
        ref={ref}
        role="status"
        aria-label="Loading"
        className={cn('size-4 animate-spin', className)}
        {...props}
      />
    )
  }
)

Spinner.displayName = 'Spinner'

export { Spinner }
