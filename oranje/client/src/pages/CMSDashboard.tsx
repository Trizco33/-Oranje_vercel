import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { LogOut, FileText, Settings, BookOpen, Globe, Menu, X, LayoutDashboard, Bell } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import CMSEditor from "./CMSEditor";
import CMSPages from "../components/CMSPages";
import CMSBlog from "../components/CMSBlog";
import CMSSEO from "../components/CMSSEO";
import CMSPushPanel from "../components/CMSPushPanel";

const CMS_NAV = [
  { id: "content", label: "Conteúdo", icon: FileText },
  { id: "pages", label: "Páginas", icon: BookOpen },
  { id: "blog", label: "Blog", icon: Globe },
  { id: "push", label: "Notificações Push", icon: Bell },
  { id: "seo", label: "SEO", icon: Settings },
];

export default function CMSDashboard() {
  const navigate = useNavigate();
  const utils = trpc.useUtils();
  const [activeTab, setActiveTab] = useState("content");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setSidebarOpen(false);
  }, [activeTab]);

  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [sidebarOpen]);

  const logoutMutation = trpc.auth.logout.useMutation();

  const handleLogout = async () => {
    try {
      const apiBase = import.meta.env.VITE_API_URL || "";
      // Clear CMS session cookie via REST endpoint
      await fetch(`${apiBase}/api/cms/logout`, { method: "POST", credentials: "include" });
      // Also clear app JWT session via tRPC
      try { await logoutMutation.mutateAsync(); } catch (_) { /* ignore */ }
      // Invalidate tRPC auth cache so AdminGuard knows we're logged out
      utils.auth.me.setData(undefined, null);
      await utils.auth.me.invalidate();
      navigate("/login", { replace: true });
    } catch (error) {
      toast.error("Erro ao desconectar");
      navigate("/login", { replace: true });
    }
  };

  const activeLabel = CMS_NAV.find(t => t.id === activeTab)?.label ?? 'CMS';

  return (
    <div className="admin-layout">
      {/* Mobile sidebar overlay */}
      <div
        className={`admin-sidebar-overlay ${sidebarOpen ? 'active' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        {/* Sidebar header */}
        <div style={{
          padding: '20px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img src="/logo.png" alt="Oranje" style={{ height: '28px', width: 'auto' }} />
            <div>
              <p style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', color: '#E65100' }}>
                CMS DO SITE
              </p>
              <p style={{ fontSize: '0.6875rem', color: 'rgba(255,255,255,0.5)' }}>
                Blog, Páginas, SEO
              </p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            style={{
              display: 'none',
              padding: '8px',
              borderRadius: '8px',
              border: 'none',
              background: 'rgba(255,255,255,0.08)',
              cursor: 'pointer',
              color: 'rgba(255,255,255,0.7)',
            }}
            className="admin-sidebar-close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '12px 12px' }}>
          <div className="admin-nav-group-label">Seções</div>
          {CMS_NAV.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={`admin-nav-item ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => setActiveTab(item.id)}
              >
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Sidebar footer */}
        <div style={{
          padding: '16px',
          borderTop: '1px solid rgba(255,255,255,0.08)',
        }}>
          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              width: '100%',
              padding: '10px 12px',
              borderRadius: '8px',
              border: 'none',
              background: 'rgba(255,255,255,0.04)',
              cursor: 'pointer',
              color: 'rgba(255,255,255,0.6)',
              fontSize: '0.8125rem',
              fontWeight: 500,
              fontFamily: "'Montserrat', system-ui, sans-serif",
            }}
          >
            <LogOut size={16} />
            Sair
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="admin-main">
        {/* Top bar */}
        <header className="admin-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => setSidebarOpen(true)}
              style={{
                padding: '8px',
                borderRadius: '8px',
                border: '1px solid rgba(0,37,26,0.08)',
                background: 'transparent',
                cursor: 'pointer',
                display: 'none',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: '40px',
                minHeight: '40px',
              }}
              className="admin-hamburger"
            >
              <Menu size={20} style={{ color: '#00251A' }} />
            </button>
            <h1 style={{
              fontSize: '1.125rem',
              fontWeight: 700,
              color: '#00251A',
              fontFamily: "'Montserrat', system-ui, sans-serif",
            }}>
              {activeLabel}
            </h1>
          </div>
          <Link
            to="/"
            className="admin-btn-secondary"
            style={{ padding: '8px 16px', fontSize: '0.8125rem', textDecoration: 'none' }}
          >
            Ver Site
          </Link>
        </header>

        {/* Content */}
        <div className="admin-content">
          {activeTab === "content" && <CMSEditor />}
          {activeTab === "pages" && <CMSPages onNavigate={setActiveTab} />}
          {activeTab === "blog" && <CMSBlog />}
          {activeTab === "push" && <CMSPushPanel />}
          {activeTab === "seo" && <CMSSEO />}
        </div>
      </div>

      {/* Mobile-only styles */}
      <style>{`
        @media (max-width: 767px) {
          .admin-hamburger { display: flex !important; }
          .admin-sidebar-close { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
