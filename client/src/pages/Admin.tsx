import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import {
  BarChart3, Bell, Building2, CalendarDays, ChevronRight, Edit, ImagePlus,
  Loader2, LogOut, Map, Package, Plus, Settings, Sparkles, Tag, Ticket, Trash2, Users, X, Car
} from "lucide-react";
import { useState } from "react";
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

export default function Admin() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");

  if (!user) {
    return (
      <div className="oranje-app min-h-screen flex items-center justify-center">
        <div className="text-center px-6">
          <p className="text-4xl mb-4">🔒</p>
          <p className="text-sm" style={{ color: "#C8C5C0" }}>Acesso restrito. Faça login como administrador.</p>
          <button onClick={() => navigate("/")} className="btn-gold px-5 py-2.5 rounded-xl text-sm mt-4">
            Voltar ao início
          </button>
        </div>
      </div>
    );
  }

  if (user.role !== "admin") {
    return (
      <div className="oranje-app min-h-screen flex items-center justify-center">
        <div className="text-center px-6">
          <p className="text-4xl mb-4">⛔</p>
          <p className="text-sm font-medium mb-2" style={{ color: "#E8E6E3" }}>Acesso negado</p>
          <p className="text-xs mb-4" style={{ color: "#C8C5C0" }}>Esta área é restrita a administradores.</p>
          <button onClick={() => navigate("/")} className="btn-gold px-5 py-2.5 rounded-xl text-sm">
            Voltar ao início
          </button>
        </div>
      </div>
    );
  }

  const TABS = [
    { id: "dashboard" as AdminTab, icon: BarChart3, label: "Dashboard" },
    { id: "places" as AdminTab, icon: Building2, label: "Lugares" },
    { id: "events" as AdminTab, icon: CalendarDays, label: "Eventos" },
    { id: "vouchers" as AdminTab, icon: Ticket, label: "Vouchers" },
    { id: "ads" as AdminTab, icon: Package, label: "Anúncios" },
    { id: "partners" as AdminTab, icon: Tag, label: "Parceiros" },
    { id: "drivers" as AdminTab, icon: Car, label: "Motoristas" },
    { id: "routes" as AdminTab, icon: Map, label: "Roteiros" },
    { id: "categories" as AdminTab, icon: Tag, label: "Categorias" },
    { id: "articles" as AdminTab, icon: Edit, label: "Artigos" },
    { id: "logs" as AdminTab, icon: Users, label: "Logs" },
  ];

  return (
    <div className="oranje-app min-h-screen flex flex-col">
      {/* ── Admin Header ─────────────────────────────────────────────── */}
      <header className="oranje-header px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/")} className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: "rgba(216,138,61,0.1)" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D88A3D" strokeWidth="2.5" strokeLinecap="round">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
          </button>
          <OranjeLogoImg size={28} showText={false} />
          <div>
            <p className="text-xs font-bold tracking-widest" style={{ color: "#D88A3D" }}>ADMIN</p>
            <p className="text-xs" style={{ color: "#C8C5C0" }}>{user.name}</p>
          </div>
        </div>
        <button onClick={() => { logout(); navigate("/"); }}
          className="w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: "rgba(216,138,61,0.1)" }}>
          <LogOut size={16} style={{ color: "#D88A3D" }} />
        </button>
      </header>

      {/* ── Tab Navigation ───────────────────────────────────────────── */}
      <div className="scroll-x flex gap-1 px-4 py-3 border-b" style={{ borderColor: "rgba(216,138,61,0.1)" }}>
        {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all"
              style={{
                background: isActive ? "rgba(216,138,61,0.15)" : "transparent",
                color: isActive ? "#D88A3D" : "#6B7A8D",
                border: isActive ? "1px solid rgba(216,138,61,0.3)" : "1px solid transparent",
              }}
            >
              <Icon size={13} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── Content ─────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
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
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
function AdminDashboard() {
  const { data: stats } = trpc.admin.stats.useQuery();

  const cards = [
    { label: "Lugares", value: stats?.places ?? 0, icon: Building2, color: "#D88A3D" },
    { label: "Eventos", value: stats?.events ?? 0, icon: CalendarDays, color: "#5B8DD9" },
    { label: "Parceiros", value: stats?.partners ?? 0, icon: Tag, color: "#5BD98A" },
    { label: "Usuários", value: stats?.users ?? 0, icon: Users, color: "#D95B8D" },
  ];

  return (
    <div>
      <h2 className="section-title text-lg mb-4">Visão Geral</h2>
      <div className="grid grid-cols-2 gap-3 mb-6">
        {cards.map(card => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="glass-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: `${card.color}20` }}>
                  <Icon size={16} style={{ color: card.color }} />
                </div>
                <span className="text-xs" style={{ color: "#C8C5C0" }}>{card.label}</span>
              </div>
              <p className="text-2xl font-bold" style={{ color: "#E8E6E3" }}>{card.value}</p>
            </div>
          );
        })}
      </div>

      <div className="glass-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={16} style={{ color: "#D88A3D" }} />
          <h3 className="text-sm font-semibold" style={{ color: "#E8E6E3" }}>Ações Rápidas</h3>
        </div>
        <div className="space-y-2">
          {[
            { label: "Adicionar novo lugar", icon: Building2 },
            { label: "Criar evento", icon: CalendarDays },
            { label: "Gerar imagem com IA", icon: ImagePlus },
          ].map(action => {
            const Icon = action.icon;
            return (
              <div key={action.label} className="flex items-center gap-3 p-3 rounded-xl cursor-pointer"
                style={{ background: "rgba(216,138,61,0.06)" }}>
                <Icon size={15} style={{ color: "#D88A3D" }} />
                <span className="text-sm flex-1" style={{ color: "#E8E6E3" }}>{action.label}</span>
                <ChevronRight size={14} style={{ color: "#D88A3D" }} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// All admin components imported from separate files above

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
      <h2 className="section-title text-base mb-4">Histórico de Ações</h2>
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 size={20} className="animate-spin" style={{ color: "#D88A3D" }} />
        </div>
      ) : !logs || logs.length === 0 ? (
        <div className="glass-card p-6 text-center">
          <p style={{ color: "#C8C5C0" }}>Nenhuma ação registrada ainda.</p>
        </div>
      ) : (
        <div className="glass-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(216,138,61,0.2)" }}>
                <th className="text-left px-4 py-3" style={{ color: "#D88A3D", fontWeight: 600 }}>Data</th>
                <th className="text-left px-4 py-3" style={{ color: "#D88A3D", fontWeight: 600 }}>Admin</th>
                <th className="text-left px-4 py-3" style={{ color: "#D88A3D", fontWeight: 600 }}>Ação</th>
                <th className="text-left px-4 py-3" style={{ color: "#D88A3D", fontWeight: 600 }}>Tipo</th>
                <th className="text-left px-4 py-3" style={{ color: "#D88A3D", fontWeight: 600 }}>ID</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log: any) => {
                const actionLabel = actionLabels[log.action] || log.action;
                const createdAt = new Date(log.createdAt).toLocaleString("pt-BR");

                return (
                  <tr key={log.id} style={{ borderBottom: "1px solid rgba(216,138,61,0.1)" }}>
                    <td className="px-4 py-3" style={{ color: "#C8C5C0" }}>{createdAt}</td>
                    <td className="px-4 py-3" style={{ color: "#E8E6E3" }}>{log.userEmail}</td>
                    <td className="px-4 py-3" style={{ color: "#E8E6E3" }}>{actionLabel}</td>
                    <td className="px-4 py-3" style={{ color: "#C8C5C0" }}>{log.entityType}</td>
                    <td className="px-4 py-3" style={{ color: "#C8C5C0" }}>#{log.entityId}</td>
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
