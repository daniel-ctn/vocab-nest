import { cn } from '@/lib/cn'

export function Skeleton({
  className,
  style,
}: {
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <div
      className={cn('animate-pulse bg-border-subtle', className)}
      style={style}
    />
  )
}

export function SkeletonStatBlock() {
  return (
    <div className="flex flex-col gap-1.5">
      <Skeleton className="h-12 w-20" />
      <Skeleton className="h-3 w-24" />
    </div>
  )
}

export function SkeletonChapterHeader() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-3 w-32" />
      <Skeleton className="h-12 w-64" />
      <Skeleton className="h-px w-full" />
      <Skeleton className="h-4 w-80" />
    </div>
  )
}

export function SkeletonSpecimen() {
  return (
    <div className="space-y-2 py-5">
      <Skeleton className="h-6 w-1/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  )
}

export function SkeletonRow() {
  return (
    <div className="flex items-center justify-between py-4">
      <div className="flex-1 space-y-2">
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <Skeleton className="h-5 w-12" />
    </div>
  )
}
