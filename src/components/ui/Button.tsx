import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'

type Variant = 'filled' | 'tonal' | 'outline' | 'text' | 'danger'
type Size = 'sm' | 'md' | 'lg'

const VARIANTS: Record<Variant, string> = {
  filled: 'bg-accent text-on-accent hover:bg-accent-hover shadow-e1 hover:shadow-e2',
  tonal: 'bg-accent-container text-on-accent-container hover:brightness-[0.97]',
  outline: 'border border-line bg-transparent text-on-surface hover:bg-surface-low',
  text: 'bg-transparent text-accent hover:bg-accent-container/60',
  danger: 'bg-danger text-white hover:brightness-95 shadow-e1',
}

const SIZES: Record<Size, string> = {
  sm: 'h-9 px-4 text-sm gap-1.5',
  md: 'h-11 px-6 text-[15px] gap-2',
  lg: 'h-12 px-7 text-base gap-2',
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  icon?: ReactNode
}

export function Button({
  variant = 'filled',
  size = 'md',
  loading = false,
  icon,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-full font-medium',
        'transition-[background-color,box-shadow,transform] duration-200',
        'active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50',
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span
          aria-hidden
          className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      ) : (
        icon
      )}
      {children}
    </button>
  )
}
