import { cn } from '@/lib/cn'

/**
 * Drop-capped paragraph. The first letter is floated and set in display serif
 * at roughly 3 lines tall. Visually hides the letter from the inline run so a
 * screen reader receives the original prose.
 */
export function DropCap({
  children,
  className,
}: {
  children: string
  className?: string
}) {
  const text = children ?? ''
  const first = text.charAt(0)
  const rest = text.slice(1)

  return (
    <p
      className={cn(
        'font-sans text-[17px] leading-[1.7] text-ink',
        className
      )}
    >
      <span
        aria-hidden
        className="float-left mr-3 mt-2 font-display text-[68px] leading-[0.82] font-semibold text-ink"
      >
        {first}
      </span>
      <span className="sr-only">{first}</span>
      {rest}
    </p>
  )
}
