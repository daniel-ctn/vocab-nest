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
      className={cn(
        'animate-pulse rounded-lg bg-border-subtle',
        className
      )}
      style={style}
    />
  )
}

export function SkeletonStatCard() {
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-surface border border-border">
      <Skeleton className="w-10 h-10 rounded-lg shrink-0" />
      <div className="space-y-2 flex-1">
        <Skeleton className="h-7 w-16" />
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
  )
}

export function SkeletonVocabCard() {
  return (
    <div className="p-4 rounded-xl bg-surface border border-border space-y-3">
      <div className="space-y-2">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
      </div>
      <div className="flex flex-wrap gap-2">
        <Skeleton className="h-5 w-16 rounded-md" />
        <Skeleton className="h-5 w-20 rounded-md" />
      </div>
    </div>
  )
}

export function SkeletonGroupCard() {
  return (
    <div className="p-4 rounded-xl bg-surface border border-border space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-full" />
        </div>
        <Skeleton className="w-7 h-7 rounded-md shrink-0" />
      </div>
      <Skeleton className="h-4 w-20" />
    </div>
  )
}

export function SkeletonPageHeader() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-9 w-48" />
      <Skeleton className="h-5 w-64" />
    </div>
  )
}

export function SkeletonBarChart() {
  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-surface border border-border space-y-5">
      <Skeleton className="h-7 w-48" />
      <div className="flex items-end gap-2 h-40">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-2">
            <Skeleton className="h-5 w-8" />
            <div className="w-full flex-1 rounded-lg bg-border-subtle overflow-hidden relative">
              <Skeleton
                className="absolute bottom-0 left-0 right-0 rounded-lg"
                style={{ height: `${30 + i * 15}%` }}
              />
            </div>
            <Skeleton className="h-4 w-12" />
          </div>
        ))}
      </div>
    </div>
  )
}
