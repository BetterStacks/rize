import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("shimmer shimmer-bg rounded-md", className)}
      {...props}
    />
  )
}

export { Skeleton }
