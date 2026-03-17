import { OranjeHeader } from "@/components/OranjeHeader";
import { PlaceCard } from "@/components/PlaceCard";
import { TabBar } from "@/components/TabBar";
import { trpc } from "@/lib/trpc";
import { Clock, Map } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { DSBadge } from "@/components/ds";

export default function RouteDetail() {
  const params = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: route, isLoading } = trpc.routes.byId.useQuery({ id: Number(params.id) });

  if (isLoading) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--ds-color-bg-primary)" }}>
        <OranjeHeader showBack onBack={() => navigate(-1 as any)} />
        <div className="p-4 space-y-3">
          <div className="rounded-2xl animate-pulse" style={{ height: 80, background: "var(--ds-color-bg-secondary)" }} />
          {[...Array(3)].map((_, i) => (
            <div key={i} className="rounded-2xl animate-pulse" style={{ height: 180, background: "var(--ds-color-bg-secondary)" }} />
          ))}
        </div>
      </div>
    );
  }

  if (!route) return null;

  return (
    <div style={{ minHeight: "100vh", background: "var(--ds-color-bg-primary)" }}>
      <OranjeHeader title={route.title} showBack onBack={() => navigate("/roteiros")} />

      <div className="px-4 pt-4">
        {/* Route Info */}
        <div className="p-4 mb-5 rounded-2xl" style={{ background: "rgba(230,81,0,0.06)", border: "1px solid rgba(230,81,0,0.12)" }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "var(--ds-color-accent)" }}>
              <Map size={18} style={{ color: "#fff" }} />
            </div>
            <div>
              <h1 className="text-base font-semibold" style={{ color: "var(--ds-color-text-primary)" }}>{route.title}</h1>
              <div className="flex items-center gap-3 mt-0.5">
                {route.theme && <DSBadge variant="outline">{route.theme}</DSBadge>}
                {route.duration && (
                  <div className="flex items-center gap-1">
                    <Clock size={10} style={{ color: "var(--ds-color-text-secondary)" }} />
                    <span className="text-xs" style={{ color: "var(--ds-color-text-secondary)" }}>{route.duration}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          {route.description && (
            <p className="text-sm" style={{ color: "var(--ds-color-text-secondary)" }}>{route.description}</p>
          )}
        </div>

        {/* Places in route */}
        <div className="flex items-center gap-2 mb-3">
          <div className="h-0.5 w-6 rounded" style={{ background: "linear-gradient(90deg, var(--ds-color-accent), transparent)" }} />
          <p className="text-xs font-semibold tracking-wide" style={{ color: "var(--ds-color-accent)" }}>
            {(route as any).places?.length ?? 0} LUGARES NESTE ROTEIRO
          </p>
        </div>

        {(route as any).places?.length === 0 ? (
          <div className="text-center py-10 rounded-2xl" style={{ background: "rgba(230,81,0,0.06)", border: "1px solid rgba(230,81,0,0.12)" }}>
            <p className="text-3xl mb-2">📍</p>
            <p className="text-sm" style={{ color: "var(--ds-color-text-secondary)" }}>Este roteiro ainda não tem lugares adicionados.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {(route as any).places?.map((place: any, idx: number) => (
              <div key={place.id} className="flex gap-3 items-start">
                <div className="flex flex-col items-center flex-shrink-0 mt-2">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: "var(--ds-color-accent)", color: "#fff" }}>
                    {idx + 1}
                  </div>
                  {idx < (route as any).places.length - 1 && (
                    <div className="w-0.5 flex-1 mt-1" style={{ background: "rgba(230,81,0,0.2)", minHeight: 40 }} />
                  )}
                </div>
                <div className="flex-1">
                  <PlaceCard place={place} compact />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ height: 100 }} />
      <TabBar />
    </div>
  );
}
