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
      <SiteHeader />
      <main className="flex-1 pt-20">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
