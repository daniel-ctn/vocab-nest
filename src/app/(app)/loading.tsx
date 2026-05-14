import {
  SkeletonChapterHeader,
  SkeletonRow,
  SkeletonStatBlock,
} from '@/components/skeleton'

export default function AppLoading() {
  return (
    <div className="space-y-12 animate-fade-up">
      <SkeletonChapterHeader />

      <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3">
        <SkeletonStatBlock />
        <SkeletonStatBlock />
        <SkeletonStatBlock />
      </div>

      <div className="space-y-2">
        <div className="divide-y divide-rule">
          <SkeletonRow />
          <SkeletonRow />
          <SkeletonRow />
          <SkeletonRow />
        </div>
      </div>
    </div>
  )
}
