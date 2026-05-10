import {
  SkeletonPageHeader,
  SkeletonStatCard,
  SkeletonVocabCard,
  SkeletonBarChart,
} from '@/components/skeleton'

export default function AppLoading() {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <SkeletonPageHeader />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SkeletonStatCard />
        <SkeletonStatCard />
        <SkeletonStatCard />
        <SkeletonStatCard />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <SkeletonVocabCard />
        <SkeletonVocabCard />
      </div>

      <SkeletonBarChart />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <SkeletonVocabCard />
        <SkeletonVocabCard />
        <SkeletonVocabCard />
        <SkeletonVocabCard />
      </div>
    </div>
  )
}
