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
      className={`site-light min-h-screen flex flex-col ${className}`}
      style={{
        background: "#FFFFFF",
        color: "#00251A",
        fontFamily: "'Montserrat', system-ui, -apple-system, sans-serif",
      }}
    >
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:top-2 focus:left-2 focus:px-4 focus:py-2 focus:rounded-md focus:text-white"
        style={{ background: "#E65100" }}
      >
        Pular para o conteúdo principal
      </a>
      <SiteHeader />
      <main id="main-content" className="flex-1" role="main" style={{ paddingTop: 68 }}>
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
