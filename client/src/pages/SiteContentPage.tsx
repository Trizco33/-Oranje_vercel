import { ReactNode } from "react";
import SiteLayout from "@/components/SiteLayout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

interface SiteContentPageProps {
  title: string;
  subtitle?: string;
  content: ReactNode;
  cta?: {
    label: string;
    href: string;
  };
  breadcrumbs?: Array<{ label: string; href: string }>;
}

export default function SiteContentPage({
  title,
  subtitle,
  content,
  cta,
  breadcrumbs,
}: SiteContentPageProps) {
  return (
    <SiteLayout>
      {/* Breadcrumbs */}
      {breadcrumbs && (
        <div className="bg-[#F5F5DC] border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center gap-2 text-sm">
              {breadcrumbs.map((crumb, idx) => (
                <div key={crumb.href} className="flex items-center gap-2">
                  <Link to={crumb.href} className="text-[#E65100] hover:text-[#D84500]">
                    {crumb.label}
                  </Link>
                  {idx < breadcrumbs.length - 1 && (
                    <span className="text-gray-400">/</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-[#004D40] to-[#00251A] text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-5xl font-bold mb-4 font-montserrat">{title}</h1>
          {subtitle && <p className="text-xl text-gray-200">{subtitle}</p>}
        </div>
      </section>

      {/* Content */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
            {content}
          </div>

          {/* CTA */}
          {cta && (
            <div className="mt-12 p-8 bg-[#F5F5DC] rounded-lg border-2 border-[#E65100]">
              <p className="text-lg text-gray-700 mb-4">
                Quer explorar mais? Baixe o app Oranje e tenha acesso a todas as experiências!
              </p>
              <Button
                asChild
                size="lg"
                className="bg-[#E65100] hover:bg-[#D84500] text-white flex items-center gap-2"
              >
                <Link to={cta.href}>
                  {cta.label}
                  <ArrowRight size={18} />
                </Link>
              </Button>
            </div>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}
