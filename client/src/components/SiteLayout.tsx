import { ReactNode } from "react";
import SiteHeader from "./SiteHeader";
import SiteFooter from "./SiteFooter";

interface SiteLayoutProps {
  children: ReactNode;
  className?: string;
}

export default function SiteLayout({ children, className = "" }: SiteLayoutProps) {
  return (
    <div
      className={`min-h-screen flex flex-col ${className}`}
      style={{ background: "var(--ds-color-bg-primary, #00251A)" }}
    >
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:top-2 focus:left-2 focus:px-4 focus:py-2 focus:rounded-md focus:text-white"
        style={{ background: "var(--ds-color-accent, #E65100)" }}
      >
        Pular para o conteúdo principal
      </a>
      <SiteHeader />
      <main id="main-content" className="flex-1 pt-20" role="main">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
