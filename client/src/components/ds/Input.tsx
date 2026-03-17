import React, { useId } from 'react';
import { cn } from '@/lib/utils';

export interface DSInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Label text */
  label?: string;
  /** Helper / description text below the input */
  helperText?: string;
  /** Error message (replaces helperText and turns input red) */
  error?: string;
  /** Icon slot (left) */
  iconLeft?: React.ReactNode;
  /** Icon slot (right) */
  iconRight?: React.ReactNode;
  /** Size preset */
  size?: 'sm' | 'md' | 'lg';
  /** Full width (default true) */
  fullWidth?: boolean;
}

const sizeStyles = {
  sm: 'h-9 text-[var(--ds-text-sm)] px-3',
  md: 'h-11 text-[var(--ds-text-base)] px-4',
  lg: 'h-[3.25rem] text-[var(--ds-text-lg)] px-5',
};

export const DSInput = React.forwardRef<HTMLInputElement, DSInputProps>(
  (
    {
      label,
      helperText,
      error,
      iconLeft,
      iconRight,
      size = 'md',
      fullWidth = true,
      className,
      id: externalId,
      disabled,
      ...rest
    },
    ref
  ) => {
    const autoId = useId();
    const inputId = externalId || autoId;
    const helperId = `${inputId}-helper`;
    const errorId = `${inputId}-error`;

    return (
      <div className={cn('flex flex-col gap-1.5', fullWidth && 'w-full')}>
        {/* Label */}
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              'text-[var(--ds-text-sm)] font-[var(--ds-font-medium)]',
              'text-[var(--ds-color-text-secondary)]',
              'tracking-[var(--ds-tracking-wide)]',
              disabled && 'opacity-50'
            )}
          >
            {label}
          </label>
        )}

        {/* Input wrapper */}
        <div className="relative">
          {/* Left icon */}
          {iconLeft && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ds-color-text-muted)] [&>svg]:w-[1.15em] [&>svg]:h-[1.15em] pointer-events-none">
              {iconLeft}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            aria-invalid={!!error}
            aria-describedby={error ? errorId : helperText ? helperId : undefined}
            className={cn(
              // Base
              'w-full rounded-[var(--ds-radius-lg)]',
              'bg-[var(--ds-color-bg-surface)] text-[var(--ds-color-text-primary)]',
              'border transition-all duration-[var(--ds-duration-normal)] ease-[var(--ds-ease-default)]',
              'placeholder:text-[var(--ds-color-text-subtle)]',
              'font-[var(--ds-font-regular)]',
              // Min touch target
              'min-h-[var(--ds-touch-target-sm)]',
              // Size
              sizeStyles[size],
              // Icons offset
              iconLeft && 'pl-10',
              iconRight && 'pr-10',
              // States
              !error
                ? [
                    'border-[var(--ds-color-border-default)]',
                    'hover:border-[var(--ds-color-border-emphasis)]',
                    'focus:border-[var(--ds-color-border-focus)] focus:ring-2 focus:ring-[var(--ds-color-accent-muted)]',
                  ]
                : [
                    'border-[var(--ds-color-error)]',
                    'focus:ring-2 focus:ring-red-500/20',
                  ],
              // Disabled
              disabled && 'opacity-50 cursor-not-allowed',
              'outline-none',
              className
            )}
            {...rest}
          />

          {/* Right icon */}
          {iconRight && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--ds-color-text-muted)] [&>svg]:w-[1.15em] [&>svg]:h-[1.15em] pointer-events-none">
              {iconRight}
            </span>
          )}
        </div>

        {/* Helper / Error text */}
        {error && (
          <p id={errorId} role="alert" className="text-[var(--ds-text-xs)] text-[var(--ds-color-error)] mt-0.5">
            {error}
          </p>
        )}
        {!error && helperText && (
          <p id={helperId} className="text-[var(--ds-text-xs)] text-[var(--ds-color-text-muted)] mt-0.5">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

DSInput.displayName = 'DSInput';

export default DSInput;
