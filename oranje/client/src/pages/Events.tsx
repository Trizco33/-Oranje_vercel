import { OranjeHeader } from "@/components/OranjeHeader";
import { TabBar } from "@/components/TabBar";
import { CalendarDays, Clock, MapPin, Tag } from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { DSBadge, DSButton } from "@/components/ds";
import { useEventsList, useEventById } from "@/hooks/useMockData";

export function EventsList() {
  const { data: events, isLoading } = useEventsList({ upcoming: false });

  return (
    <div style={{ minHeight: "100vh", background: "var(--ds-color-bg-primary)" }}>
      <OranjeHeader title="Eventos" />

      <div className="px-5 pt-5">
        <p className="text-xs mb-4" style={{ color: "var(--ds-color-text-muted)" }}>
          Agenda cultural de Holambra
        </p>

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-2xl" style={{ height: 100, background: "var(--ds-color-bg-surface)", animation: "ds-pulse-glow 2s ease-in-out infinite" }} />
            ))}
          </div>
        ) : events?.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">🎪</p>
            <p className="text-sm" style={{ color: "var(--ds-color-text-muted)" }}>Nenhum evento cadastrado ainda.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {events?.map(event => (
              <Link key={event.id} to={`/app/evento/${event.id}`}>
                <div
                  className="flex gap-4 transition-all duration-200"
                  style={{
                    padding: 16,
                    borderRadius: "var(--ds-radius-xl)",
                    background: "var(--ds-color-bg-surface)",
                    border: "1px solid var(--ds-color-border-default)",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--ds-color-border-accent)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--ds-color-border-default)"; e.currentTarget.style.transform = "translateY(0)"; }}
                >
                  {event.coverImage ? (
                    <div className="flex-shrink-0 overflow-hidden" style={{ width: 64, height: 64, borderRadius: "var(--ds-radius-lg)" }}>
                      <img src={event.coverImage} alt={event.title} className="w-full h-full object-cover" loading="lazy" />
                    </div>
                  ) : (
                    <div
                      className="flex flex-col items-center justify-center flex-shrink-0"
                      style={{
                        width: 64,
                        height: 64,
                        borderRadius: "var(--ds-radius-lg)",
                        background: "var(--ds-color-accent-muted)",
                        border: "1px solid var(--ds-color-border-accent)",
                      }}
                    >
                      <span className="text-lg font-bold" style={{ color: "var(--ds-color-accent)" }}>
                        {new Date(event.date).toLocaleDateString("pt-BR", { day: "2-digit" })}
                      </span>
                      <span className="text-[10px] uppercase font-medium" style={{ color: "var(--ds-color-text-muted)" }}>
                        {new Date(event.date).toLocaleDateString("pt-BR", { month: "short" })}
                      </span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {event.isFeatured && <DSBadge variant="accent" size="sm">Destaque</DSBadge>}
                      {event.isCancelled && <DSBadge variant="error" size="sm">Cancelado</DSBadge>}
                    </div>
                    <h3 className="text-sm font-semibold line-clamp-1" style={{ color: "var(--ds-color-text-primary)" }}>
                      {event.title}
                    </h3>
                    {event.location && (
                      <div className="flex items-center gap-1 mt-1">
                        <MapPin size={10} style={{ color: "var(--ds-color-accent)" }} />
                        <span className="text-xs line-clamp-1" style={{ color: "var(--ds-color-text-muted)" }}>{event.location}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-3 mt-1">
                      <div className="flex items-center gap-1">
                        <Clock size={10} style={{ color: "var(--ds-color-text-muted)" }} />
                        <span className="text-xs" style={{ color: "var(--ds-color-text-muted)" }}>
                          {event.time}
                        </span>
                      </div>
                      {event.price && (
                        <span className="text-xs font-medium" style={{ color: "var(--ds-color-accent)" }}>{event.price}</span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div style={{ height: 100 }} />
      <TabBar />
    </div>
  );
}

export function EventDetail() {
  const params = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: event, isLoading } = useEventById(Number(params.id));

  if (isLoading) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--ds-color-bg-primary)" }}>
        <OranjeHeader showBack onBack={() => navigate(-1)} />
        <div className="p-5 space-y-4">
          <div className="rounded-2xl" style={{ height: 220, background: "var(--ds-color-bg-surface)", animation: "ds-pulse-glow 2s ease-in-out infinite" }} />
          <div className="rounded-xl" style={{ height: 80, background: "var(--ds-color-bg-surface)", animation: "ds-pulse-glow 2s ease-in-out infinite" }} />
        </div>
      </div>
    );
  }

  if (!event) return null;

  return (
    <div style={{ minHeight: "100vh", background: "var(--ds-color-bg-primary)" }}>
      {/* Cover */}
      <div className="relative" style={{ height: 240 }}>
        {event.coverImage ? (
          <img src={event.coverImage} alt={event.title} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, var(--ds-color-bg-secondary), var(--ds-color-bg-elevated))" }}>
            <CalendarDays size={60} style={{ color: "var(--ds-color-accent-muted)" }} />
          </div>
        )}
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(0,37,26,0.3) 0%, rgba(0,37,26,0.8) 100%)" }} />
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 flex items-center justify-center"
          style={{ width: 40, height: 40, borderRadius: "var(--ds-radius-full)", background: "rgba(0,37,26,0.6)", backdropFilter: "blur(8px)" }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--ds-color-text-primary)" strokeWidth="2.5" strokeLinecap="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
        </button>
        {event.isFeatured && (
          <div className="absolute top-4 right-4">
            <DSBadge variant="accent">Destaque</DSBadge>
          </div>
        )}
      </div>

      <div className="px-5 pt-5">
        <h1 style={{ fontSize: 24, fontWeight: 700, fontFamily: "var(--ds-font-display)", color: "var(--ds-color-text-primary)", marginBottom: 12 }}>
          {event.title}
        </h1>

        {/* Meta info */}
        <div
          className="space-y-3 mb-5"
          style={{
            padding: 16,
            borderRadius: "var(--ds-radius-xl)",
            background: "var(--ds-color-bg-surface)",
            border: "1px solid var(--ds-color-border-default)",
          }}
        >
          <div className="flex items-center gap-3">
            <CalendarDays size={16} style={{ color: "var(--ds-color-accent)" }} />
            <div>
              <p className="text-sm font-medium" style={{ color: "var(--ds-color-text-primary)" }}>
                {new Date(event.date).toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })}
              </p>
              <p className="text-xs" style={{ color: "var(--ds-color-text-muted)" }}>
                às {event.time}
                {event.endDate && ` — até ${new Date(event.endDate).toLocaleDateString("pt-BR", { day: "2-digit", month: "long" })}`}
              </p>
            </div>
          </div>
          {event.location && (
            <div className="flex items-center gap-3">
              <MapPin size={16} style={{ color: "var(--ds-color-accent)" }} />
              <p className="text-sm" style={{ color: "var(--ds-color-text-primary)" }}>{event.location}</p>
            </div>
          )}
          {event.price && (
            <div className="flex items-center gap-3">
              <Tag size={16} style={{ color: "var(--ds-color-accent)" }} />
              <p className="text-sm font-semibold" style={{ color: "var(--ds-color-accent)" }}>{event.price}</p>
            </div>
          )}
        </div>

        {event.description && (
          <div className="mb-5">
            <p className="text-sm leading-relaxed" style={{ color: "var(--ds-color-text-secondary)" }}>
              {event.description}
            </p>
          </div>
        )}

        <DSBadge variant="default" size="sm">{event.category}</DSBadge>
      </div>

      <div style={{ height: 100 }} />
      <TabBar />
    </div>
  );
}

export default EventsList;
