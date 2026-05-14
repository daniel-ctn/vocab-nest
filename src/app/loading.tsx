import { Skeleton } from '@/components/skeleton'

export default function RootLoading() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-cream px-6">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex items-center gap-2.5">
          <Skeleton className="h-7 w-7" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-px w-full" />
        <div className="space-y-4">
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    </div>
  )
}
