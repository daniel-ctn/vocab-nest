import { Skeleton } from '@/components/skeleton'

export default function RootLoading() {
  return (
    <div className="min-h-dvh bg-cream flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex items-center justify-center gap-2.5">
          <Skeleton className="w-8 h-8 rounded-lg" />
          <Skeleton className="h-6 w-32" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    </div>
  )
}
