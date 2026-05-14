import { cn } from '@/lib/cn'

export function Rule({
  className,
  animate = false,
  fade = false,
}: {
  className?: string
  animate?: boolean
  fade?: boolean
}) {
  return (
    <hr
      className={cn(
        'h-px border-0',
        fade ? 'rule-fade' : 'bg-rule',
        animate && 'animate-rule-draw',
        className
      )}
    />
  )
}
