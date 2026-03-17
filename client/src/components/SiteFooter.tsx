import { Link } from "react-router-dom";
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from "lucide-react";

export default function SiteFooter() {
  return (
    <footer className="bg-[#004D40] text-white">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <img src="/logo.png" alt="Oranje" className="h-10 w-auto mb-4" />
            <p className="text-sm text-gray-300">
              Seu guia definitivo de Holambra. Descubra os melhores lugares, eventos e experiências.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-bold text-white mb-4">Navegação</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-gray-300 hover:text-[#E65100] transition">
                  Início
                </Link>
              </li>
              <li>
                <Link to="/roteiros" className="text-gray-300 hover:text-[#E65100] transition">
                  Roteiros
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-gray-300 hover:text-[#E65100] transition">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/parceiros" className="text-gray-300 hover:text-[#E65100] transition">
                  Parceiros
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-bold text-white mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/privacidade" className="text-gray-300 hover:text-[#E65100] transition">
                  Política de Privacidade
                </Link>
              </li>
              <li>
                <Link to="/termos" className="text-gray-300 hover:text-[#E65100] transition">
                  Termos de Serviço
                </Link>
              </li>
              <li>
                <Link to="/app" className="text-gray-300 hover:text-[#E65100] transition">
                  Abrir App
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-white mb-4">Contato</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Mail size={16} className="text-[#E65100]" />
                <a href="mailto:contato@oranje.com.br" className="text-gray-300 hover:text-[#E65100] transition">
                  contato@oranje.com.br
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={16} className="text-[#E65100]" />
                <a href="tel:+551940000000" className="text-gray-300 hover:text-[#E65100] transition">
                  (19) 4000-0000
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin size={16} className="text-[#E65100] mt-1" />
                <span className="text-gray-300">Holambra, SP</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Social Links */}
        <div className="border-t border-[#00251A] pt-8 mb-8">
          <div className="flex justify-center gap-6">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-[#E65100] transition"
            >
              <Facebook size={20} />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-[#E65100] transition"
            >
              <Instagram size={20} />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-[#E65100] transition"
            >
              <Twitter size={20} />
            </a>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-[#00251A] pt-8 text-center text-sm text-gray-400">
          <p>&copy; 2026 Oranje. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
