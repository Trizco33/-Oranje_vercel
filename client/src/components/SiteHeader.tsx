import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SiteHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { label: "Início", href: "/" },
    { label: "O que fazer", href: "/o-que-fazer-em-holambra" },
    { label: "Roteiros", href: "/roteiros" },
    { label: "Mapa", href: "/mapa" },
    { label: "Blog", href: "/blog" },
    { label: "Parceiros", href: "/parceiros" },
    { label: "Contato", href: "/contato" },
  ];

  const isActive = (href: string) => location.pathname === href;

  return (
    <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition">
          <picture>
            <source srcSet="/logo.webp" type="image/webp" />
            <img src="/logo.png" alt="Oranje" className="h-12 w-auto" />
          </picture>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                isActive(item.href)
                  ? "text-[#E65100] bg-[#F5F5DC]"
                  : "text-gray-700 hover:text-[#E65100] hover:bg-gray-50"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Desktop CTA Button */}
        <div className="hidden md:block">
          <Button
            asChild
            className="bg-[#E65100] hover:bg-[#D84500] text-white font-montserrat font-bold"
          >
            <Link to="/app">Abrir o App</Link>
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition"
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white animate-in fade-in slide-in-from-top-2">
          <nav className="flex flex-col p-4 gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setIsMenuOpen(false)}
                className={`block px-4 py-3 rounded-lg transition font-medium ${
                  isActive(item.href)
                    ? "bg-[#E65100] text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {item.label}
              </Link>
            ))}
            <Button
              asChild
              className="w-full bg-[#E65100] hover:bg-[#D84500] text-white mt-4 font-montserrat font-bold"
            >
              <Link to="/app">Abrir o App</Link>
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
}
