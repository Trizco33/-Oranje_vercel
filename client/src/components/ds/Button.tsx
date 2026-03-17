import React from 'react';
import { cn } from '@/lib/utils';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface DSButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual variant */
  variant?: ButtonVariant;
  /** Size preset */
  size?: ButtonSize;
  /** Full width */
  fullWidth?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Icon slot (left) */
  iconLeft?: React.ReactNode;
  /** Icon slot (right) */
  iconRight?: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: [
    'bg-[var(--ds-color-accent)] text-white',
    'hover:bg-[var(--ds-color-accent-hover)] hover:shadow-[var(--ds-shadow-accent)]',
    'active:bg-[var(--ds-color-accent-active)] active:scale-[0.97]',
    'focus-visible:ring-2 focus-visible:ring-[var(--ds-color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ds-color-bg-primary)]',
    'disabled:opacity-40 disabled:pointer-events-none disabled:shadow-none',
  ].join(' '),

  secondary: [
    'bg-transparent text-[var(--ds-color-text-primary)]',
    'border border-[var(--ds-color-border-emphasis)]',
    'hover:bg-[var(--ds-color-bg-surface-hover)] hover:border-[var(--ds-color-text-secondary)]',
    'active:scale-[0.97] active:bg-[var(--ds-color-bg-surface)]',
    'focus-visible:ring-2 focus-visible:ring-[var(--ds-color-border-emphasis)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ds-color-bg-primary)]',
    'disabled:opacity-40 disabled:pointer-events-none',
  ].join(' '),

  ghost: [
    'bg-transparent text-[var(--ds-color-text-secondary)]',
    'hover:bg-[var(--ds-color-bg-surface)] hover:text-[var(--ds-color-text-primary)]',
    'active:scale-[0.97] active:bg-[var(--ds-color-bg-surface-hover)]',
    'focus-visible:ring-2 focus-visible:ring-[var(--ds-color-border-default)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ds-color-bg-primary)]',
    'disabled:opacity-40 disabled:pointer-events-none',
  ].join(' '),
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-9 px-3.5 text-[var(--ds-text-sm)] gap-1.5 rounded-[var(--ds-radius-md)]',
  md: 'h-11 px-5 text-[var(--ds-text-base)] gap-2 rounded-[var(--ds-radius-lg)]',
  lg: 'h-[3.25rem] px-7 text-[var(--ds-text-lg)] gap-2.5 rounded-[var(--ds-radius-xl)]',
};

export const DSButton = React.forwardRef<HTMLButtonElement, DSButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      loading = false,
      iconLeft,
      iconRight,
      children,
      className,
      disabled,
      ...rest
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        aria-disabled={disabled || loading || undefined}
        className={cn(
          // Base
          'inline-flex items-center justify-center',
          'font-[var(--ds-font-semibold)] tracking-[var(--ds-tracking-wide)]',
          'select-none whitespace-nowrap',
          'transition-all duration-[var(--ds-duration-normal)] ease-[var(--ds-ease-default)]',
          // Touch target
          'min-h-[var(--ds-touch-target-sm)]',
          // Variant & size
          variantStyles[variant],
          sizeStyles[size],
          // Full width
          fullWidth && 'w-full',
          // Custom
          className
        )}
        {...rest}
      >
        {loading && (
          <svg
            className="animate-spin -ml-0.5 mr-2 h-4 w-4"
            xmlns="https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Loading_spinner.svg/960px-Loading_spinner.svg.png"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12" cy="12" r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {!loading && iconLeft && (
          <span className="flex-shrink-0 [&>svg]:w-[1.1em] [&>svg]:h-[1.1em]">{iconLeft}</span>
        )}
        {children && <span>{children}</span>}
        {!loading && iconRight && (
          <span className="flex-shrink-0 [&>svg]:w-[1.1em] [&>svg]:h-[1.1em]">{iconRight}</span>
        )}
      </button>
    );
  }
);

DSButton.displayName = 'DSButton';

export default DSButton;
