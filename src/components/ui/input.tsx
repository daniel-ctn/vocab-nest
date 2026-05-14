import { forwardRef } from 'react'
import type { ComponentPropsWithoutRef, ReactNode } from 'react'
import { cn } from '@/lib/cn'

/**
 * Inputs are hairline-underlined fields, not boxes. They sit on cream.
 * The bottom border darkens to ink on focus.
 */

const fieldBase =
  'w-full bg-transparent border-0 border-b border-rule px-0 py-2 text-[15px] text-ink placeholder:text-ink-tertiary placeholder:font-display placeholder:italic focus:outline-none focus:border-ink transition-colors disabled:opacity-60'

export const Input = forwardRef<
  HTMLInputElement,
  ComponentPropsWithoutRef<'input'>
>(function Input({ className, ...props }, ref) {
  return (
    <input ref={ref} className={cn(fieldBase, className)} {...props} />
  )
})

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  ComponentPropsWithoutRef<'textarea'>
>(function Textarea({ className, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={cn(fieldBase, 'resize-none', className)}
      {...props}
    />
  )
})

export function Label({
  children,
  htmlFor,
  className,
  hint,
}: {
  children: ReactNode
  htmlFor?: string
  className?: string
  hint?: ReactNode
}) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn(
        'flex items-baseline justify-between text-[11px] uppercase tracking-[0.14em] font-semibold text-ink-secondary',
        className
      )}
    >
      <span>{children}</span>
      {hint && (
        <span className="text-[11px] normal-case tracking-normal font-normal font-display italic text-ink-tertiary">
          {hint}
        </span>
      )}
    </label>
  )
}

export function Field({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return <div className={cn('space-y-1.5', className)}>{children}</div>
}
