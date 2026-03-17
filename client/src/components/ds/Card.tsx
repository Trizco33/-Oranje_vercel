import React from 'react';
import { cn } from '@/lib/utils';

export interface DSCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Enables hover lift effect */
  interactive?: boolean;
  /** Image URL for the card header */
  image?: string;
  /** Alt text for the image */
  imageAlt?: string;
  /** Aspect ratio of the image container */
  imageAspect?: 'video' | 'square' | 'wide';
  /** Dark gradient overlay on image (great for text on images) */
  overlay?: boolean;
  /** Content rendered on top of the image overlay */
  overlayContent?: React.ReactNode;
  /** Visual variant */
  variant?: 'default' | 'elevated' | 'outline' | 'glass';
  /** Padding preset */
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const aspectMap = {
  video: 'aspect-video',
  square: 'aspect-square',
  wide: 'aspect-[21/9]',
};

const variantStyles = {
  default: [
    'bg-[var(--ds-color-bg-surface)]',
    'border border-[var(--ds-color-border-default)]',
  ].join(' '),
  elevated: [
    'bg-[var(--ds-color-bg-elevated)]',
    'border border-[var(--ds-color-border-subtle)]',
    'shadow-[var(--ds-shadow-md)]',
  ].join(' '),
  outline: [
    'bg-transparent',
    'border border-[var(--ds-color-border-emphasis)]',
  ].join(' '),
  glass: [
    'bg-[var(--ds-color-bg-surface)]',
    'backdrop-blur-xl',
    'border border-[var(--ds-color-border-default)]',
  ].join(' '),
};

const paddingStyles = {
  none: '',
  sm: 'p-3',
  md: 'p-4 sm:p-5',
  lg: 'p-5 sm:p-6 lg:p-8',
};

export const DSCard = React.forwardRef<HTMLDivElement, DSCardProps>(
  (
    {
      interactive = false,
      image,
      imageAlt = '',
      imageAspect = 'video',
      overlay = false,
      overlayContent,
      variant = 'default',
      padding = 'md',
      children,
      className,
      ...rest
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          // Base
          'rounded-[var(--ds-radius-xl)] overflow-hidden',
          'transition-all duration-[var(--ds-duration-normal)] ease-[var(--ds-ease-default)]',
          // Variant
          variantStyles[variant],
          // Interactive
          interactive && [
            'cursor-pointer',
            'hover:border-[var(--ds-color-border-accent)] hover:shadow-[var(--ds-shadow-lg)]',
            'hover:-translate-y-1',
            'active:scale-[0.99] active:translate-y-0',
          ],
          className
        )}
        {...rest}
      >
        {/* Image section */}
        {image && (
          <div className={cn('relative overflow-hidden', aspectMap[imageAspect])}>
            <img
              src={image}
              alt={imageAlt}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-[var(--ds-duration-slow)] ease-[var(--ds-ease-out)] group-hover:scale-105"
            />
            {overlay && (
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--ds-color-bg-primary)] via-[var(--ds-color-bg-primary)]/40 to-transparent" />
            )}
            {overlayContent && (
              <div className="absolute inset-0 flex flex-col justify-end p-4">
                {overlayContent}
              </div>
            )}
          </div>
        )}

        {/* Content */}
        {children && (
          <div className={cn(paddingStyles[padding])}>
            {children}
          </div>
        )}
      </div>
    );
  }
);

DSCard.displayName = 'DSCard';

export default DSCard;
