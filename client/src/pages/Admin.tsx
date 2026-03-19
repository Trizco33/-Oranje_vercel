import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import {
  BarChart3, Bell, Building2, CalendarDays, ChevronRight, Edit, ImagePlus,
  Loader2, LogOut, Map, Menu, Package, Plus, Settings, Sparkles, Tag, Ticket, Trash2, Users, X, Car
} from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { OranjeLogoImg } from "@/components/OranjeLogoSVG";
import DriversAdminTab from "./DriversAdminTab";
import { AdminPlaces } from "@/components/AdminPlaces";
import { AdminEvents } from "@/components/AdminEvents";
import { AdminVouchers } from "@/components/AdminVouchers";
import { AdminAds } from "@/components/AdminAds";
import { AdminPartners } from "@/components/AdminPartners";
import { AdminRoutes } from "@/components/AdminRoutes";
import { AdminCategories } from "@/components/AdminCategories";
import { AdminDriversMarketplace } from "@/components/AdminDriversMarketplace";
import { AdminArticles } from "@/components/AdminArticles";

type AdminTab = "dashboard" | "places" | "events" | "vouchers" | "ads" | "partners" | "routes" | "logs" | "drivers" | "categories" | "articles";

const NAV_GROUPS = [
  {
    label: "Gestão",
    items: [
      { id: "places" as AdminTab, icon: Building2, label: "Lugares" },
      { id: "events" as AdminTab, icon: CalendarDays, label: "Eventos" },
      { id: "vouchers" as AdminTab, icon: Ticket, label: "Cupons" },
    ],
  },
  {
    label: "Conteúdo",
    items: [
      { id: "routes" as AdminTab, icon: Map, label: "Roteiros" },
      { id: "articles" as AdminTab, icon: Edit, label: "Artigos" },
      { id: "partners" as AdminTab, icon: Tag, label: "Parceiros" },
    ],
  },
  {
    label: "Sistema",
    items: [
      { id: "drivers" as AdminTab, icon: Car, label: "Motoristas" },
      { id: "ads" as AdminTab, icon: Package, label: "Anúncios" },
      { id: "categories" as AdminTab, icon: Tag, label: "Categorias" },
      { id: "logs" as AdminTab, icon: Users, label: "Logs" },
    ],
  },
];

export default function Admin() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [activeTab]);

  // Prevent body scroll when sidebar open on mobile
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [sidebarOpen]);

  if (!user) {
    return (
      <div className="admin-layout" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', padding: '24px' }}>
          <p style={{ fontSize: '3rem', marginBottom: '16px' }}>🔒</p>
          <p style={{ color: '#718096', fontSize: '0.875rem' }}>Acesso restrito. Faça login como administrador.</p>
          <button onClick={() => navigate("/")} className="admin-btn-primary" style={{ marginTop: '16px' }}>
            Voltar ao início
          </button>
        </div>
      </div>
    );
  }

  if (user.role !== "admin") {
    return (
      <div className="admin-layout" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', padding: '24px' }}>
          <p style={{ fontSize: '3rem', marginBottom: '16px' }}>⛔</p>
          <p style={{ fontWeight: 600, color: '#1A1A1A', marginBottom: '8px' }}>Acesso negado</p>
          <p style={{ color: '#718096', fontSize: '0.875rem', marginBottom: '16px' }}>Esta área é restrita a administradores.</p>
          <button onClick={() => navigate("/")} className="admin-btn-primary">
            Voltar ao início
          </button>
        </div>
      </div>
    );
  }

  const activeLabel = activeTab === 'dashboard' ? 'Dashboard'
    : NAV_GROUPS.flatMap(g => g.items).find(i => i.id === activeTab)?.label ?? 'Admin';

  return (
    <div className="admin-layout">
      {/* ── Mobile sidebar overlay ── */}
      <div
        className={`admin-sidebar-overlay ${sidebarOpen ? 'active' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* ── Sidebar ── */}
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
            <OranjeLogoImg size={28} showText={false} />
            <div>
              <p style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', color: '#E65100' }}>
                ADMIN
              </p>
              <p style={{ fontSize: '0.6875rem', color: 'rgba(255,255,255,0.5)' }}>
                Painel de Gestão
              </p>
            </div>
          </div>
          {/* Close button - mobile only */}
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
        <nav style={{ flex: 1, overflowY: 'auto', padding: '8px 12px' }}>
          {/* Dashboard */}
          <div style={{ padding: '4px 0' }}>
            <button
              className={`admin-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              <BarChart3 size={18} />
              Dashboard
            </button>
          </div>

          {/* Grouped nav */}
          {NAV_GROUPS.map(group => (
            <div key={group.label}>
              <div className="admin-nav-group-label">{group.label}</div>
              {group.items.map(item => {
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
            </div>
          ))}
        </nav>

        {/* Sidebar footer */}
        <div style={{
          padding: '16px',
          borderTop: '1px solid rgba(255,255,255,0.08)',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '10px 12px',
            borderRadius: '8px',
            background: 'rgba(255,255,255,0.04)',
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'rgba(230, 81, 0, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#E65100',
              fontSize: '0.75rem',
              fontWeight: 700,
            }}>
              {user.name?.charAt(0)?.toUpperCase() ?? 'A'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: '#FFFFFF',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>{user.name}</p>
              <p style={{ fontSize: '0.6875rem', color: 'rgba(255,255,255,0.4)' }}>Administrador</p>
            </div>
            <button
              onClick={() => { if (confirm('Deseja sair?')) { logout(); navigate("/"); } }}
              style={{
                padding: '6px',
                borderRadius: '6px',
                border: 'none',
                background: 'rgba(255,255,255,0.06)',
                cursor: 'pointer',
                color: 'rgba(255,255,255,0.5)',
                display: 'flex',
                alignItems: 'center',
              }}
              title="Sair"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main Content ── */}
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
            <div>
              <h1 style={{
                fontSize: '1.125rem',
                fontWeight: 700,
                color: '#00251A',
                fontFamily: "'Montserrat', system-ui, sans-serif",
              }}>
                {activeLabel}
              </h1>
            </div>
          </div>
          <button
            onClick={() => navigate("/")}
            className="admin-btn-secondary"
            style={{ padding: '8px 16px', fontSize: '0.8125rem' }}
          >
            Ver Site
          </button>
        </header>

        {/* Content area */}
        <div className="admin-content">
          {activeTab === "dashboard" && <AdminDashboard />}
          {activeTab === "places" && <AdminPlaces />}
          {activeTab === "events" && <AdminEvents />}
          {activeTab === "vouchers" && <AdminVouchers />}
          {activeTab === "ads" && <AdminAds />}
          {activeTab === "partners" && <AdminPartners />}
          {activeTab === "drivers" && <AdminDriversMarketplace />}
          {activeTab === "routes" && <AdminRoutes />}
          {activeTab === "categories" && <AdminCategories />}
          {activeTab === "articles" && <AdminArticles />}
          {activeTab === "logs" && <AdminLogs />}
        </div>
      </div>

      {/* Mobile-only styles via inline style tag */}
      <style>{`
        @media (max-width: 767px) {
          .admin-hamburger { display: flex !important; }
          .admin-sidebar-close { display: flex !important; }
        }
      `}</style>
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
function AdminDashboard() {
  const { data: stats } = trpc.admin.stats.useQuery();

  const cards = [
    { label: "Lugares", value: stats?.places ?? 0, icon: Building2, color: "#E65100" },
    { label: "Eventos", value: stats?.events ?? 0, icon: CalendarDays, color: "#0D4A40" },
    { label: "Parceiros", value: stats?.partners ?? 0, icon: Tag, color: "#004D40" },
    { label: "Usuários", value: stats?.users ?? 0, icon: Users, color: "#7C3AED" },
  ];

  return (
    <div>
      <h2 style={{
        fontSize: '1.25rem',
        fontWeight: 700,
        color: '#00251A',
        marginBottom: '20px',
        fontFamily: "'Montserrat', system-ui, sans-serif",
      }}>Visão Geral</h2>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px',
        marginBottom: '24px',
      }}>
        {cards.map(card => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="admin-stat-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: `${card.color}12`,
                }}>
                  <Icon size={18} style={{ color: card.color }} />
                </div>
                <span style={{ fontSize: '0.8125rem', color: '#718096', fontWeight: 500 }}>{card.label}</span>
              </div>
              <p style={{ fontSize: '2rem', fontWeight: 700, color: '#1A1A1A' }}>{card.value}</p>
            </div>
          );
        })}
      </div>

      <div className="admin-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <Sparkles size={18} style={{ color: '#E65100' }} />
          <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#1A1A1A' }}>Ações Rápidas</h3>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[
            { label: "Adicionar novo lugar", icon: Building2 },
            { label: "Criar evento", icon: CalendarDays },
            { label: "Gerar imagem com IA", icon: ImagePlus },
          ].map(action => {
            const Icon = action.icon;
            return (
              <div key={action.label} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: '8px',
                cursor: 'pointer',
                border: '1px solid rgba(0,37,26,0.05)',
              }}>
                <Icon size={16} style={{ color: '#E65100' }} />
                <span style={{ flex: 1, fontSize: '0.875rem', color: '#1A1A1A', fontWeight: 500 }}>{action.label}</span>
                <ChevronRight size={14} style={{ color: '#E65100' }} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Logs ─────────────────────────────────────────────────────────────────────
function AdminLogs() {
  const { data: logs, isLoading } = trpc.admin.logs.useQuery({ limit: 50, offset: 0 });

  const actionLabels: Record<string, string> = {
    create_place: "Criou lugar",
    update_place: "Atualizou lugar",
    delete_place: "Deletou lugar",
    create_event: "Criou evento",
    update_event: "Atualizou evento",
    delete_event: "Deletou evento",
  };

  return (
    <div>
      <h2 style={{
        fontSize: '1.25rem',
        fontWeight: 700,
        color: '#00251A',
        marginBottom: '20px',
        fontFamily: "'Montserrat', system-ui, sans-serif",
      }}>Histórico de Ações</h2>
      {isLoading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 0' }}>
          <Loader2 size={24} className="animate-spin" style={{ color: '#E65100' }} />
        </div>
      ) : !logs || logs.length === 0 ? (
        <div className="admin-card" style={{ padding: '48px 24px', textAlign: 'center' }}>
          <p style={{ color: '#718096' }}>Nenhuma ação registrada ainda.</p>
        </div>
      ) : (
        <div className="admin-card" style={{ overflowX: 'auto' }}>
          <table className="admin-table-responsive" style={{ width: '100%', fontSize: '0.875rem', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(0,37,26,0.08)' }}>
                {['Data', 'Admin', 'Ação', 'Tipo', 'ID'].map(h => (
                  <th key={h} style={{
                    textAlign: 'left',
                    padding: '12px 16px',
                    color: '#718096',
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {logs.map((log: any) => {
                const actionLabel = actionLabels[log.action] || log.action;
                const createdAt = new Date(log.createdAt).toLocaleString("pt-BR");
                return (
                  <tr key={log.id} style={{ borderBottom: '1px solid rgba(0,37,26,0.05)' }}>
                    <td data-label="Data" style={{ padding: '14px 16px', color: '#718096' }}>{createdAt}</td>
                    <td data-label="Admin" style={{ padding: '14px 16px', color: '#1A1A1A', fontWeight: 500 }}>{log.userEmail}</td>
                    <td data-label="Ação" style={{ padding: '14px 16px', color: '#1A1A1A' }}>{actionLabel}</td>
                    <td data-label="Tipo" style={{ padding: '14px 16px', color: '#718096' }}>{log.entityType}</td>
                    <td data-label="ID" style={{ padding: '14px 16px', color: '#718096' }}>#{log.entityId}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
