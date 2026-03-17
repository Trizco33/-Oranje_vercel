import { ReactNode } from "react";
import SiteHeader from "./SiteHeader";
import SiteFooter from "./SiteFooter";

interface SiteLayoutProps {
  children: ReactNode;
  className?: string;
}

export default function SiteLayout({ children, className = "" }: SiteLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <SiteHeader />
      <main className={`flex-1 pt-20 ${className}`}>
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
