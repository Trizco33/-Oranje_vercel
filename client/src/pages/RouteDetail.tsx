import { OranjeHeader } from "@/components/OranjeHeader";
import { PlaceCard } from "@/components/PlaceCard";
import { TabBar } from "@/components/TabBar";
import { trpc } from "@/lib/trpc";
import { Clock, Map } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";

export default function RouteDetail() {
  const params = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: route, isLoading } = trpc.routes.byId.useQuery({ id: Number(params.id) });

  if (isLoading) {
    return (
      <div className="oranje-app min-h-screen">
        <OranjeHeader showBack onBack={() => navigate("~-1")} />
        <div className="p-4 space-y-3">
          <div className="shimmer rounded-2xl" style={{ height: 80 }} />
          {[...Array(3)].map((_, i) => (
            <div key={i} className="shimmer rounded-2xl" style={{ height: 180 }} />
          ))}
        </div>
      </div>
    );
  }

  if (!route) return null;

  return (
    <div className="oranje-app min-h-screen">
      <OranjeHeader title={route.title} showBack onBack={() => navigate("/roteiros")} />

      <div className="px-4 pt-4">
        {/* Route Info */}
        <div className="glass-card p-4 mb-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #D88A3D, #E8A05A)" }}>
              <Map size={18} style={{ color: "#0E1A26" }} />
            </div>
            <div>
              <h1 className="text-base font-semibold" style={{ fontFamily: "'Playfair Display', serif", color: "#E8E6E3" }}>
                {route.title}
              </h1>
              <div className="flex items-center gap-3 mt-0.5">
                {route.theme && <span className="tag-chip">{route.theme}</span>}
                {route.duration && (
                  <div className="flex items-center gap-1">
                    <Clock size={10} style={{ color: "#C8C5C0" }} />
                    <span className="text-xs" style={{ color: "#C8C5C0" }}>{route.duration}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          {route.description && (
            <p className="text-sm" style={{ color: "#C8C5C0" }}>{route.description}</p>
          )}
        </div>

        {/* Places in route */}
        <div className="flex items-center gap-2 mb-3">
          <div className="h-0.5 w-6 rounded" style={{ background: "linear-gradient(90deg, #D88A3D, transparent)" }} />
          <p className="text-xs font-semibold tracking-wide" style={{ color: "#D88A3D" }}>
            {(route as any).places?.length ?? 0} LUGARES NESTE ROTEIRO
          </p>
        </div>

        {(route as any).places?.length === 0 ? (
          <div className="text-center py-10 glass-card">
            <p className="text-3xl mb-2">📍</p>
            <p className="text-sm" style={{ color: "#C8C5C0" }}>Este roteiro ainda não tem lugares adicionados.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {(route as any).places?.map((place: any, idx: number) => (
              <div key={place.id} className="flex gap-3 items-start">
                {/* Step number */}
                <div className="flex flex-col items-center flex-shrink-0 mt-2">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ background: "linear-gradient(135deg, #D88A3D, #E8A05A)", color: "#0E1A26" }}>
                    {idx + 1}
                  </div>
                  {idx < (route as any).places.length - 1 && (
                    <div className="w-0.5 flex-1 mt-1" style={{ background: "rgba(216,138,61,0.2)", minHeight: 40 }} />
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

      <div className="mb-tab" />
      <TabBar />
    </div>
  );
}
