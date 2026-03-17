import React from 'react';
import { cn } from '@/lib/utils';

export type BadgeVariant = 'default' | 'accent' | 'success' | 'warning' | 'error' | 'outline';
export type BadgeSize = 'sm' | 'md';

export interface DSBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Visual variant */
  variant?: BadgeVariant;
  /** Size preset */
  size?: BadgeSize;
  /** Optional dot indicator */
  dot?: boolean;
  /** Optional icon (left) */
  icon?: React.ReactNode;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: [
    'bg-[var(--ds-color-bg-surface-hover)]',
    'text-[var(--ds-color-text-secondary)]',
    'border border-[var(--ds-color-border-default)]',
  ].join(' '),

  accent: [
    'bg-[var(--ds-color-accent-muted)]',
    'text-[var(--ds-color-text-accent)]',
    'border border-[var(--ds-color-border-accent)]',
  ].join(' '),

  success: [
    'bg-emerald-500/15',
    'text-emerald-400',
    'border border-emerald-500/30',
  ].join(' '),

  warning: [
    'bg-amber-500/15',
    'text-amber-400',
    'border border-amber-500/30',
  ].join(' '),

  error: [
    'bg-red-500/15',
    'text-red-400',
    'border border-red-500/30',
  ].join(' '),

  outline: [
    'bg-transparent',
    'text-[var(--ds-color-text-secondary)]',
    'border border-[var(--ds-color-border-emphasis)]',
  ].join(' '),
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-[0.65rem] gap-1',
  md: 'px-2.5 py-1 text-[var(--ds-text-xs)] gap-1.5',
};

export const DSBadge = React.forwardRef<HTMLSpanElement, DSBadgeProps>(
  ({ variant = 'default', size = 'sm', dot, icon, children, className, ...rest }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center',
          'font-[var(--ds-font-semibold)] uppercase tracking-[var(--ds-tracking-wider)]',
          'rounded-[var(--ds-radius-full)]',
          'whitespace-nowrap select-none',
          'leading-none',
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...rest}
      >
        {dot && (
          <span
            className={cn(
              'w-1.5 h-1.5 rounded-full flex-shrink-0',
              variant === 'accent' && 'bg-[var(--ds-color-accent)]',
              variant === 'success' && 'bg-emerald-400',
              variant === 'warning' && 'bg-amber-400',
              variant === 'error' && 'bg-red-400',
              variant === 'default' && 'bg-[var(--ds-color-text-muted)]',
              variant === 'outline' && 'bg-[var(--ds-color-text-muted)]'
            )}
            aria-hidden="true"
          />
        )}
        {icon && (
          <span className="flex-shrink-0 [&>svg]:w-3 [&>svg]:h-3" aria-hidden="true">
            {icon}
          </span>
        )}
        {children}
      </span>
    );
  }
);

DSBadge.displayName = 'DSBadge';

export default DSBadge;
