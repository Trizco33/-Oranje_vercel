import { OranjeHeader } from "@/components/OranjeHeader";
import { TabBar } from "@/components/TabBar";
import { trpc } from "@/lib/trpc";
import { CalendarDays, Clock, MapPin, Tag } from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";

export function EventsList() {
  const { data: events, isLoading } = trpc.events.list.useQuery({ upcoming: false });

  return (
    <div className="oranje-app min-h-screen">
      <OranjeHeader title="Eventos" />

      <div className="px-4 pt-4">
        <p className="text-xs mb-4" style={{ color: "#C8C5C0" }}>
          Agenda cultural de Holambra
        </p>

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="shimmer rounded-2xl" style={{ height: 100 }} />
            ))}
          </div>
        ) : events?.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">🎪</p>
            <p className="text-sm" style={{ color: "#C8C5C0" }}>Nenhum evento cadastrado ainda.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {events?.map(event => (
              <Link key={event.id} to={`/evento/${event.id}`}>
                <div className="event-card p-4 flex gap-4">
                  {/* Image or date block */}
                  {event.coverImage ? (
                    <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                      <img src={event.coverImage} alt={event.title} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-xl flex flex-col items-center justify-center flex-shrink-0"
                      style={{ background: "rgba(216,138,61,0.15)", border: "1px solid rgba(216,138,61,0.3)" }}>
                      <span className="text-lg font-bold" style={{ color: "#D88A3D" }}>
                        {new Date(event.startsAt).toLocaleDateString("pt-BR", { day: "2-digit" })}
                      </span>
                      <span className="text-[10px] uppercase font-medium" style={{ color: "#C8C5C0" }}>
                        {new Date(event.startsAt).toLocaleDateString("pt-BR", { month: "short" })}
                      </span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {event.isFeatured && <span className="badge-featured">Destaque</span>}
                      {event.status === "cancelled" && (
                        <span className="text-xs px-2 py-0.5 rounded-full"
                          style={{ background: "rgba(255,100,100,0.1)", color: "#ff6464" }}>
                          Cancelado
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-semibold line-clamp-1" style={{ color: "#E8E6E3" }}>
                      {event.title}
                    </h3>
                    {event.location && (
                      <div className="flex items-center gap-1 mt-1">
                        <MapPin size={10} style={{ color: "#D88A3D" }} />
                        <span className="text-xs line-clamp-1" style={{ color: "#C8C5C0" }}>{event.location}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-3 mt-1">
                      <div className="flex items-center gap-1">
                        <Clock size={10} style={{ color: "#C8C5C0" }} />
                        <span className="text-xs" style={{ color: "#C8C5C0" }}>
                          {new Date(event.startsAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      {event.price && (
                        <span className="text-xs font-medium" style={{ color: "#D88A3D" }}>{event.price}</span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="mb-tab" />
      <TabBar />
    </div>
  );
}

export function EventDetail() {
  const params = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: event, isLoading } = trpc.events.byId.useQuery({ id: Number(params.id) });

  if (isLoading) {
    return (
      <div className="oranje-app min-h-screen">
        <OranjeHeader showBack onBack={() => navigate(-1)} />
        <div className="p-4 space-y-4">
          <div className="shimmer rounded-2xl" style={{ height: 220 }} />
          <div className="shimmer rounded-xl" style={{ height: 80 }} />
        </div>
      </div>
    );
  }

  if (!event) return null;

  const tags: string[] = Array.isArray(event.tags) ? event.tags : [];

  return (
    <div className="oranje-app min-h-screen">
      {/* Cover */}
      <div className="relative" style={{ height: 220 }}>
        {event.coverImage ? (
          <img src={event.coverImage} alt={event.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #162233, rgba(216,138,61,0.1))" }}>
            <CalendarDays size={60} style={{ color: "rgba(216,138,61,0.3)" }} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/70" />
        <button
          onClick={() => navigate("~-1")}
          className="absolute top-4 left-4 w-10 h-10 rounded-full flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)" }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E8E6E3" strokeWidth="2.5" strokeLinecap="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
        </button>
        {event.isFeatured && (
          <div className="absolute top-4 right-4">
            <span className="badge-featured">Destaque</span>
          </div>
        )}
      </div>

      <div className="px-4 pt-5">
        <h1 className="text-2xl font-bold mb-3" style={{ fontFamily: "'Playfair Display', serif", color: "#E8E6E3" }}>
          {event.title}
        </h1>

        {/* Meta info */}
        <div className="glass-card p-4 mb-4 space-y-3">
          <div className="flex items-center gap-3">
            <CalendarDays size={16} style={{ color: "#D88A3D" }} />
            <div>
              <p className="text-sm font-medium" style={{ color: "#E8E6E3" }}>
                {new Date(event.startsAt).toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })}
              </p>
              <p className="text-xs" style={{ color: "#C8C5C0" }}>
                às {new Date(event.startsAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                {event.endsAt && ` — ${new Date(event.endsAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`}
              </p>
            </div>
          </div>

          {event.location && (
            <div className="flex items-center gap-3">
              <MapPin size={16} style={{ color: "#D88A3D" }} />
              <p className="text-sm" style={{ color: "#E8E6E3" }}>{event.location}</p>
            </div>
          )}

          {event.price && (
            <div className="flex items-center gap-3">
              <Tag size={16} style={{ color: "#D88A3D" }} />
              <p className="text-sm font-semibold" style={{ color: "#D88A3D" }}>{event.price}</p>
            </div>
          )}
        </div>

        {event.description && (
          <div className="mb-4">
            <p className="text-sm leading-relaxed" style={{ color: "#C8C5C0" }}>
              {event.description}
            </p>
          </div>
        )}

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {tags.map(tag => <span key={tag} className="tag-chip">{tag}</span>)}
          </div>
        )}

        {event.mapsUrl && (
          <a
            href={event.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full btn-gold py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
          >
            <MapPin size={16} />
            Como chegar
          </a>
        )}
      </div>

      <div className="mb-tab" />
      <TabBar />
    </div>
  );
}

export default EventsList;
