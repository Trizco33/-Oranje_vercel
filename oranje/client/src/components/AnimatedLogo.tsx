import { useEffect, useRef } from 'react';

export function AnimatedLogo() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Verificar se já foi animado nesta sessão
    const hasAnimated = sessionStorage.getItem('oranje-logo-animated');
    if (hasAnimated) return;

    // Respeitar prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      sessionStorage.setItem('oranje-logo-animated', 'true');
      return;
    }

    // Marcar como animado
    sessionStorage.setItem('oranje-logo-animated', 'true');

    // Obter elementos SVG
    const svg = containerRef.current?.querySelector('svg');
    if (!svg) return;

    const ring = svg.querySelector('#ring circle') as SVGCircleElement;
    const leaf = svg.querySelector('#leaf') as SVGGElement;
    const text = svg.querySelector('#text') as SVGGElement;

    if (!ring || !leaf || !text) return;

    // Calcular perímetro do anel para stroke-dasharray
    const radius = ring.r.baseVal.value;
    const circumference = 2 * Math.PI * radius;

    // Inicializar estado
    ring.style.strokeDasharray = `${circumference}`;
    ring.style.strokeDashoffset = `${circumference}`;
    leaf.style.opacity = '0';
    leaf.style.transform = 'scale(0.9)';
    text.style.opacity = '0';
    text.style.transform = 'translateY(8px)';

    // Animar anel (0-800ms)
    const ringAnimation = ring.animate(
      [
        { strokeDashoffset: `${circumference}` },
        { strokeDashoffset: '0' }
      ],
      {
        duration: 800,
        easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        fill: 'forwards'
      }
    );

    // Animar folha (600-1000ms)
    setTimeout(() => {
      leaf.animate(
        [
          { opacity: '0', transform: 'scale(0.9)' },
          { opacity: '1', transform: 'scale(1)' }
        ],
        {
          duration: 400,
          easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
          fill: 'forwards'
        }
      );
    }, 600);

    // Animar texto (900-1300ms)
    setTimeout(() => {
      text.animate(
        [
          { opacity: '0', transform: 'translateY(8px)' },
          { opacity: '1', transform: 'translateY(0)' }
        ],
        {
          duration: 400,
          easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
          fill: 'forwards'
        }
      );
    }, 900);

    return () => {
      ringAnimation.cancel();
    };
  }, []);

  return (
    <div ref={containerRef} className="flex items-center justify-center">
      <svg viewBox="0 0 900 700" xmlns="http://www.w3.org/2000/svg" width="280" height="196" className="drop-shadow-lg">
        {/* Anel (O) */}
        <g id="ring">
          <circle cx="280" cy="400" r="140" fill="none" stroke="#F28C28" strokeWidth="50" strokeLinecap="round" />
        </g>

        {/* Folha */}
        <g id="leaf">
          <path
            d="M 350 250 Q 380 280 370 320 Q 360 340 340 330 Q 350 290 350 250"
            fill="none"
            stroke="#F2F2F2"
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>

        {/* Texto "ranje" */}
        <g id="text">
          <text
            x="480"
            y="480"
            fontFamily="Montserrat, sans-serif"
            fontSize="120"
            fontWeight="600"
            fill="#C0C0C0"
            letterSpacing="8"
          >
            ranje
          </text>
        </g>
      </svg>
    </div>
  );
}
