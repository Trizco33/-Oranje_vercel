import { useState } from "react";
import { Link } from "react-router-dom";
import { X, Menu } from "lucide-react";

export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { label: "Explorar", href: "/app/explorar" },
    { label: "Eventos", href: "/app/eventos" },
    { label: "Favoritos", href: "/app/favoritos" },
    { label: "Roteiros", href: "/app/roteiros" },
  ];

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg transition-all"
        style={{
          background: isOpen ? "rgba(242,140,40,0.25)" : "rgba(242,140,40,0.15)",
          cursor: "pointer",
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = "rgba(242,140,40,0.25)"}
        onMouseLeave={(e) => e.currentTarget.style.background = isOpen ? "rgba(242,140,40,0.25)" : "rgba(242,140,40,0.15)"}
      >
        {isOpen ? (
          <X width={20} height={20} color="#F28C28" />
        ) : (
          <Menu width={20} height={20} color="#F28C28" />
        )}
      </button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
          style={{
            animation: "fadeIn 200ms ease-out forwards",
          }}
        >
          <style>{`
            @keyframes fadeIn {
              from {
                opacity: 0;
              }
              to {
                opacity: 1;
              }
            }
          `}</style>
        </div>
      )}

      {/* Mobile Menu Panel */}
      {isOpen && (
        <div
          className="fixed top-0 right-0 h-screen w-64 bg-[#0F1B14] z-50 md:hidden shadow-2xl"
          style={{
            animation: "slideIn 300ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
          }}
        >
          <style>{`
            @keyframes slideIn {
              from {
                transform: translateX(100%);
              }
              to {
                transform: translateX(0);
              }
            }
          `}</style>

          {/* Close Button */}
          <div className="p-4 border-b border-[rgba(242,140,40,0.12)]">
            <button
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center justify-end"
            >
              <X width={24} height={24} color="#F28C28" />
            </button>
          </div>

          {/* Menu Items */}
          <nav className="p-4 space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setIsOpen(false)}
                className="block px-4 py-3 rounded-lg transition-all"
                style={{
                  color: "#ffffff",
                  fontSize: "16px",
                  fontWeight: "500",
                  background: "rgba(242,140,40,0.1)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(242,140,40,0.2)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(242,140,40,0.1)";
                }}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Footer Info */}
          <div className="absolute bottom-4 left-4 right-4 p-4 rounded-lg bg-[rgba(242,140,40,0.1)] border border-[rgba(242,140,40,0.2)]">
            <p className="text-sm text-[#ffffff] opacity-80">
              Oranje — Guia Cultural de Holambra
            </p>
          </div>
        </div>
      )}
    </>
  );
}
