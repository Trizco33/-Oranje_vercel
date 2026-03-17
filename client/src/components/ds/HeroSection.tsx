import React from 'react';
import { cn } from '@/lib/utils';

export interface DSHeroSectionProps extends React.HTMLAttributes<HTMLElement> {
  /** Main headline */
  title: string;
  /** Optional subtitle / description */
  subtitle?: string;
  /** Primary CTA button */
  cta?: React.ReactNode;
  /** Secondary CTA button */
  ctaSecondary?: React.ReactNode;
  /** Optional badge/eyebrow above the title */
  eyebrow?: React.ReactNode;
  /** Background image URL */
  backgroundImage?: string;
  /** Size preset */
  size?: 'sm' | 'md' | 'lg';
  /** Text alignment */
  align?: 'left' | 'center';
  /** Bottom content (e.g. search bar, stats) */
  bottomContent?: React.ReactNode;
}

const sizeStyles = {
  sm: 'py-12 sm:py-16',
  md: 'py-16 sm:py-24',
  lg: 'py-20 sm:py-32 lg:py-40',
};

export const DSHeroSection = React.forwardRef<HTMLElement, DSHeroSectionProps>(
  (
    {
      title,
      subtitle,
      cta,
      ctaSecondary,
      eyebrow,
      backgroundImage,
      size = 'md',
      align = 'center',
      bottomContent,
      className,
      children,
      ...rest
    },
    ref
  ) => {
    return (
      <section
        ref={ref}
        className={cn(
          'relative overflow-hidden',
          sizeStyles[size],
          className
        )}
        {...rest}
      >
        {/* Background layers */}
        <div
          className="absolute inset-0 bg-[var(--ds-color-bg-primary)]"
          aria-hidden="true"
        >
          {/* Gradient orb — decorative */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,var(--ds-color-bg-secondary),transparent)]" />
          {/* Accent glow — subtle */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[radial-gradient(circle,var(--ds-color-accent-subtle),transparent_70%)] opacity-60" />

          {/* Background image */}
          {backgroundImage && (
            <>
              <img
                src={backgroundImage}
                alt=""
                className="absolute inset-0 w-full h-full object-cover opacity-20"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-[var(--ds-color-bg-primary)]/80 via-[var(--ds-color-bg-primary)]/60 to-[var(--ds-color-bg-primary)]" />
            </>
          )}
        </div>

        {/* Content */}
        <div
          className={cn(
            'relative z-10 container mx-auto px-4 sm:px-6',
            align === 'center' && 'text-center',
            align === 'left' && 'text-left'
          )}
        >
          <div
            className={cn(
              'max-w-3xl',
              align === 'center' && 'mx-auto',
            )}
            style={{ animation: 'ds-fade-up 0.6s ease-out both' }}
          >
            {/* Eyebrow */}
            {eyebrow && (
              <div className="mb-4 sm:mb-5">
                {eyebrow}
              </div>
            )}

            {/* Title */}
            <h1
              className={cn(
                'font-[var(--ds-font-bold)] tracking-[var(--ds-tracking-tight)]',
                'text-[var(--ds-color-text-primary)]',
                'text-[clamp(1.75rem,5vw,var(--ds-text-5xl))]',
                'leading-[var(--ds-leading-tight)]',
                'mb-4 sm:mb-6'
              )}
            >
              {title}
            </h1>

            {/* Subtitle */}
            {subtitle && (
              <p
                className={cn(
                  'text-[var(--ds-color-text-secondary)]',
                  'text-[clamp(1rem,2.5vw,var(--ds-text-xl))]',
                  'leading-[var(--ds-leading-relaxed)]',
                  'max-w-2xl',
                  align === 'center' && 'mx-auto',
                  'mb-8 sm:mb-10'
                )}
              >
                {subtitle}
              </p>
            )}

            {/* CTAs */}
            {(cta || ctaSecondary) && (
              <div
                className={cn(
                  'flex flex-wrap gap-3 sm:gap-4',
                  align === 'center' && 'justify-center',
                )}
              >
                {cta}
                {ctaSecondary}
              </div>
            )}
          </div>

          {/* Bottom content */}
          {bottomContent && (
            <div
              className="mt-10 sm:mt-14"
              style={{ animation: 'ds-fade-up 0.7s 0.15s ease-out both' }}
            >
              {bottomContent}
            </div>
          )}

          {/* Extra children */}
          {children}
        </div>
      </section>
    );
  }
);

DSHeroSection.displayName = 'DSHeroSection';

export default DSHeroSection;
