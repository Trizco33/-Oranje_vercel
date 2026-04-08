import { useState, useRef, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { OranjeHeader } from "@/components/OranjeHeader";
import { TabBar } from "@/components/TabBar";
import { trpc } from "@/lib/trpc";
import {
  MapPin, Phone, Globe, Instagram, AlertCircle, Heart, Share2,
  Star, RefreshCw, ChevronLeft, ChevronRight, Clock, Info,
  MessageCircle, Navigation, Map, ExternalLink, Route, Utensils,
  Coffee, Beer, Leaf, Building2, Cake, TreePine, IceCream, ArrowRight, Compass,
} from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { ReviewCard } from "@/components/ReviewCard";
import { ReviewForm } from "@/components/ReviewForm";
import { DSButton, DSBadge } from "@/components/ds";
import { DirectionsSheet } from "@/components/DirectionsSheet";
import { getAllPlaceImages, getPlaceImage } from "@/components/PlaceCard";
import { isBlockedCoverUrl } from "@/constants/placeImages";
import { useBusinessHours, getBusinessStatus } from "@/hooks/useBusinessHours";

/* ─── Constants ─────────────────────────────────────────────────────────────── */

const TAG_LABELS: Record<string, string> = {
  tipico_holandes: "Típico Holandês",
  cafe_da_manha: "Café da manhã",
  almoco: "Almoço",
  jantar: "Jantar",
  cafe: "Café",
  familia: "Em família",
  casal: "A dois",
  fotos: "Para fotos",
  por_do_sol: "Pôr do sol",
  turistico: "Turístico",
  central: "Centro",
  pet_friendly: "Pet Friendly",
  estacionamento: "Estacionamento",
  dia_chuvoso: "Dia chuvoso",
  noite: "À noite",
  bar: "Bar",
  gastrobar: "Gastrobar",
  lounge: "Lounge",
  cervejaria: "Cervejaria",
  premium: "Premium",
  casual: "Casual",
  amigos: "Com amigos",
  romantico: "Romântico",
  doces: "Doces",
  sorvetes: "Sorvetes",
  hotel: "Hotel",
  eventos: "Eventos",
  parque: "Parque",
  flores: "Flores",
  gratuito: "Entrada gratuita",
  kids: "Para crianças",
  criancas: "Para crianças",
  passeio: "Passeio",
  icone: "Ícone da cidade",
  classico: "Clássico",
  primeira_visita: "1ª visita",
  curadoria_oranje: "Curadoria Oranje",
  roteiro_1_dia: "Roteiro de 1 dia",
  roteiro_cultura: "Rota Cultura",
  roteiro_romantico: "Rota Romântico",
  tradicional: "Tradicional",
  historico: "Histórico",
  almoco_jantar: "Almoço e jantar",
  regional: "Regional",
  gastronomia_holandesa: "Gastronomia Holandesa",
  italiana: "Italiana",
  pizza: "Pizza",
  napolitana: "Napolitana",
  artesanal: "Artesanal",
  hamburguer: "Hamburguer",
  food_park: "Food Park",
  variado: "Variado",
  turismo_rural: "Turismo Rural",
  natureza: "Natureza",
  compras: "Compras",
  perto_do_lago: "Perto do lago",
  ao_ar_livre: "Ao ar livre",
  lago: "Lago",
  dia: "Dia",
  tarde: "Tarde",
  fim_de_semana: "Fim de semana",
  dominical: "Dominical",
  vista: "Vista bonita",
  noturno: "Noturno",
  rapido: "Rápido",
  lanche: "Lanche",
  musica_ao_vivo: "Música ao vivo",
  cafe_especial: "Café especial",
  perto_da_natureza: "Natureza próxima",
};

const CATEGORY_ICON: Record<number, React.ReactNode> = {
  1: <Utensils size={12} />,
  2: <Coffee size={12} />,
  13: <Utensils size={12} />,
  14: <Beer size={12} />,
  15: <Building2 size={12} />,
  16: <TreePine size={12} />,
  17: <IceCream size={12} />,
  4: <Leaf size={12} />,
};

const DAY_FULL: Record<string, string> = {
  dom: "Domingo",
  seg: "Segunda-feira",
  ter: "Terça-feira",
  qua: "Quarta-feira",
  qui: "Quinta-feira",
  sex: "Sexta-feira",
  sab: "Sábado",
};
const DAY_ORDER = ["seg", "ter", "qua", "qui", "sex", "sab", "dom"];

const PRICE_LABEL: Record<string, string> = {
  "$": "Econômico",
  "$$": "Moderado",
  "$$$": "Premium",
  "$$$$": "Luxo",
};

function fmt(t: string): string {
  const [h, m] = t.split(":");
  return m === "00" ? `${h}h` : `${h}h${m}`;
}
function formatInterval(open: string, close: string): string {
  return `${fmt(open)} – ${fmt(close)}`;
}

/* ─── M1: Image Gallery ──────────────────────────────────────────────────────── */

function ImageGallery({
  images, placeName, isFavorite, onFavorite, onShare,
  isFeatured, isRecommended, dataPending, rating, reviewCount,
}: {
  images: string[]; placeName: string; isFavorite: boolean;
  onFavorite: () => void; onShare: () => void;
  isFeatured?: boolean; isRecommended?: boolean; dataPending?: boolean;
  rating?: number; reviewCount?: number;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imgErrors, setImgErrors] = useState<Set<number>>(new Set());
  const scrollRef = useRef<HTMLDivElement>(null);

  const validImages = images.filter((_, i) => !imgErrors.has(i));
  const showNav = validImages.length > 1;

  function goTo(index: number) {
    setCurrentIndex(index);
    if (scrollRef.current) {
      const child = scrollRef.current.children[index] as HTMLElement;
      if (child) scrollRef.current.scrollTo({ left: child.offsetLeft, behavior: "smooth" });
    }
  }

  function handleScroll() {
    if (!scrollRef.current) return;
    const { scrollLeft, clientWidth } = scrollRef.current;
    const newIndex = Math.round(scrollLeft / clientWidth);
    if (newIndex !== currentIndex && newIndex >= 0 && newIndex < images.length) {
      setCurrentIndex(newIndex);
    }
  }

  return (
    <div className="relative w-full" style={{ height: 300 }}>
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="gallery-scroll"
        style={{ display: "flex", height: "100%", scrollSnapType: "x mandatory", overflowX: "auto" }}
      >
        {images.map((src, i) => (
          <div
            key={i}
            style={{
              flex: "0 0 100%", scrollSnapAlign: "start", height: "100%",
              display: imgErrors.has(i) ? "none" : "block",
            }}
          >
            <img
              src={src} alt={`${placeName} - Foto ${i + 1}`}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              loading={i === 0 ? "eager" : "lazy"}
              onError={() => setImgErrors(prev => new Set(prev).add(i))}
            />
          </div>
        ))}
      </div>

      {/* Bottom gradient */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "linear-gradient(to top, rgba(0,37,26,0.8) 0%, transparent 55%)" }} />

      {/* Top-left badges — only shown when dataPending=false (quality rule) */}
      <div className="absolute top-4 left-4 flex flex-wrap gap-1.5" style={{ zIndex: 3 }}>
        {isFeatured && !dataPending && <DSBadge variant="accent">Destaque</DSBadge>}
        {isRecommended && !isFeatured && !dataPending && <DSBadge variant="success">★ ORANJE</DSBadge>}
      </div>

      {/* Top-right actions */}
      <div className="absolute top-4 right-4 flex gap-2" style={{ zIndex: 3 }}>
        <button
          onClick={onShare}
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ background: "rgba(0,37,26,0.6)", backdropFilter: "blur(8px)" }}
          aria-label="Compartilhar"
        >
          <Share2 size={16} style={{ color: "#fff" }} />
        </button>
        <button
          onClick={onFavorite}
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{
            background: isFavorite ? "rgba(230,81,0,0.9)" : "rgba(0,37,26,0.6)",
            backdropFilter: "blur(8px)",
          }}
          aria-label={isFavorite ? "Remover dos favoritos" : "Salvar nos favoritos"}
        >
          <Heart size={16} fill={isFavorite ? "#fff" : "none"} stroke={isFavorite ? "#fff" : "#fff"} />
        </button>
      </div>

      {/* Rating bubble */}
      {rating && rating > 0 ? (
        <div
          className="absolute flex items-center gap-1 px-3 py-1.5 rounded-xl"
          style={{
            bottom: showNav ? 40 : 16, right: 16,
            background: "rgba(0,37,26,0.7)", backdropFilter: "blur(8px)", zIndex: 3,
          }}
        >
          <Star size={13} fill="var(--ds-color-accent)" color="var(--ds-color-accent)" />
          <span className="text-sm font-bold" style={{ color: "var(--ds-color-accent)" }}>{rating.toFixed(1)}</span>
          {reviewCount ? (
            <span className="text-xs" style={{ color: "rgba(255,255,255,0.6)" }}>({reviewCount})</span>
          ) : null}
        </div>
      ) : null}

      {/* Navigation arrows */}
      {showNav && (
        <>
          <button
            onClick={() => goTo(Math.max(0, currentIndex - 1))}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center"
            style={{
              background: "rgba(0,37,26,0.55)", backdropFilter: "blur(4px)",
              display: currentIndex === 0 ? "none" : "flex", zIndex: 3,
            }}
          >
            <ChevronLeft size={16} color="#fff" />
          </button>
          <button
            onClick={() => goTo(Math.min(validImages.length - 1, currentIndex + 1))}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center"
            style={{
              background: "rgba(0,37,26,0.55)", backdropFilter: "blur(4px)",
              display: currentIndex >= validImages.length - 1 ? "none" : "flex", zIndex: 3,
            }}
          >
            <ChevronRight size={16} color="#fff" />
          </button>
        </>
      )}

      {/* Dot indicators */}
      {showNav && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5" style={{ zIndex: 3 }}>
          {validImages.map((_, i) => (
            <button
              key={i} onClick={() => goTo(i)}
              style={{
                width: i === currentIndex ? 18 : 6, height: 6, borderRadius: 3, border: "none", padding: 0,
                background: i === currentIndex ? "var(--ds-color-accent)" : "rgba(255,255,255,0.45)",
                transition: "all 0.2s ease",
              }}
            />
          ))}
        </div>
      )}

      {showNav && (
        <div
          className="absolute bottom-3 right-3 px-2 py-0.5 rounded-full text-xs font-medium"
          style={{ background: "rgba(0,37,26,0.55)", color: "#fff", backdropFilter: "blur(4px)", zIndex: 3 }}
        >
          {currentIndex + 1}/{validImages.length}
        </div>
      )}
    </div>
  );
}

/* ─── M6: Hours Status Badge ─────────────────────────────────────────────────── */

function HoursStatusBadge({ openingHours }: { openingHours: string | null | undefined }) {
  const { status, label } = useBusinessHours(openingHours);
  if (!label) return null;

  const isOpen = status?.type === "open" || status?.type === "closes_soon";
  const isWarn = status?.type === "closes_soon";

  return (
    <span
      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{
        background: isWarn ? "rgba(230,81,0,0.15)" : isOpen ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.07)",
        color: isWarn ? "var(--ds-color-accent)" : isOpen ? "#22c55e" : "var(--ds-color-text-secondary)",
        border: `1px solid ${isWarn ? "rgba(230,81,0,0.3)" : isOpen ? "rgba(34,197,94,0.3)" : "rgba(255,255,255,0.1)"}`,
      }}
    >
      <Clock size={10} />
      {label}
    </span>
  );
}

/* ─── M6: Weekly Schedule ────────────────────────────────────────────────────── */

function WeeklySchedule({ openingHours }: { openingHours: string | null | undefined }) {
  if (!openingHours) return null;

  let schedule: Record<string, [string, string][] | null> = {};
  try {
    const parsed = JSON.parse(openingHours);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return null;
    schedule = parsed;
  } catch {
    return null;
  }

  const nowDayPt = (() => {
    const wd = new Intl.DateTimeFormat("en-US", { timeZone: "America/Sao_Paulo", weekday: "short" }).format(new Date());
    return ({ Sun: "dom", Mon: "seg", Tue: "ter", Wed: "qua", Thu: "qui", Fri: "sex", Sat: "sab" })[wd] ?? "";
  })();

  if (!DAY_ORDER.some(d => d in schedule)) return null;

  return (
    <div>
      <SectionTitle icon={<Clock size={14} />} title="Funcionamento" />
      <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(230,81,0,0.12)" }}>
        {DAY_ORDER.map((day, idx) => {
          const intervals = schedule[day];
          const isToday = day === nowDayPt;
          const isClosed = intervals === null || (Array.isArray(intervals) && intervals.length === 0);
          const hoursText = isClosed
            ? "Fechado"
            : intervals!.map(([o, c]) => formatInterval(o, c)).join("  ·  ");

          return (
            <div
              key={day}
              className="flex items-center justify-between px-4 py-2.5"
              style={{
                background: isToday ? "rgba(230,81,0,0.08)" : idx % 2 === 0 ? "rgba(255,255,255,0.025)" : "transparent",
                borderBottom: idx < DAY_ORDER.length - 1 ? "1px solid rgba(230,81,0,0.07)" : "none",
              }}
            >
              <span
                className="text-sm"
                style={{
                  color: isToday ? "var(--ds-color-accent)" : "var(--ds-color-text-primary)",
                  fontWeight: isToday ? 700 : 500,
                }}
              >
                {DAY_FULL[day]}{isToday && <span className="ml-1 text-xs opacity-60">(hoje)</span>}
              </span>
              <span
                className="text-sm"
                style={{
                  color: isClosed ? "var(--ds-color-text-secondary)" : isToday ? "var(--ds-color-accent)" : "var(--ds-color-text-secondary)",
                  fontWeight: isToday && !isClosed ? 600 : 400,
                  opacity: isClosed ? 0.45 : 1,
                }}
              >
                {hoursText}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Section utilities ──────────────────────────────────────────────────────── */

function SectionTitle({ title, icon }: { title: string; icon?: React.ReactNode }) {
  return (
    <h2 className="text-base font-bold mb-3 flex items-center gap-2"
      style={{ color: "var(--ds-color-text-primary)", fontFamily: "Montserrat, sans-serif" }}>
      {icon && <span style={{ color: "var(--ds-color-accent)", opacity: 0.8 }}>{icon}</span>}
      {title}
    </h2>
  );
}

function SectionDivider() {
  return <div style={{ height: 1, background: "rgba(230,81,0,0.1)", margin: "20px 0" }} />;
}

/* ─── M10: Related Places ────────────────────────────────────────────────────── */

function RelatedPlacesBlock({ categoryId, categoryName, excludeId }: {
  categoryId: number; categoryName: string | null; excludeId: number;
}) {
  const { data: listData } = trpc.places.list.useQuery(
    { categoryId, limit: 8, offset: 0 },
    { staleTime: 60_000 }
  );
  const related = (listData ?? []).filter((p: any) => p.id !== excludeId).slice(0, 4);
  if (related.length === 0) return null;

  return (
    <div>
      <SectionDivider />
      <SectionTitle icon={<Map size={14} />} title={`Mais em ${categoryName || "Holambra"}`} />
      <div className="flex gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
        {related.map((p: any) => {
          const img = getPlaceImage(p);
          return (
            <Link
              key={p.id}
              to={`/app/lugar/${p.id}`}
              style={{ textDecoration: "none", flexShrink: 0 }}
            >
              <div
                className="rounded-2xl overflow-hidden"
                style={{ width: 148, border: "1px solid rgba(230,81,0,0.12)", background: "var(--ds-color-bg-secondary)" }}
              >
                <div style={{ height: 90, background: "rgba(0,37,26,0.4)", overflow: "hidden" }}>
                  {img ? (
                    <img src={img} alt={p.name}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Leaf size={24} style={{ color: "rgba(230,81,0,0.3)" }} />
                    </div>
                  )}
                </div>
                <div className="px-2.5 py-2">
                  {categoryName && (
                    <p className="text-xs font-medium mb-0.5"
                      style={{ color: "var(--ds-color-accent)", opacity: 0.8 }}>
                      {categoryName}
                    </p>
                  )}
                  <p className="text-xs font-semibold leading-tight line-clamp-2"
                    style={{ color: "var(--ds-color-text-primary)", fontFamily: "Montserrat, sans-serif" }}>
                    {p.name}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

/* ─── M11: Routes Block ──────────────────────────────────────────────────────── */

function RoutesBlock({ matching }: { matching: any[] }) {
  if (matching.length === 0) return null;

  return (
    <div>
      <SectionDivider />
      <SectionTitle icon={<Route size={14} />} title="Este lugar aparece em" />
      <div className="flex flex-col gap-3">
        {matching.map((r: any) => {
          const coverImg = r.coverImage && !r.coverImage.includes("unsplash.com") ? r.coverImage : null;
          return (
            <Link
              key={r.id}
              to={`/app/roteiro/${r.id}`}
              style={{ textDecoration: "none" }}
            >
              <div
                className="flex items-center gap-3 rounded-2xl overflow-hidden"
                style={{ background: "rgba(0,37,26,0.6)", border: "1px solid rgba(230,81,0,0.18)" }}
              >
                {/* Cover thumbnail */}
                <div style={{ width: 72, height: 72, flexShrink: 0, overflow: "hidden", background: "rgba(230,81,0,0.08)" }}>
                  {coverImg ? (
                    <img src={coverImg} alt={r.title}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Route size={20} style={{ color: "rgba(230,81,0,0.35)" }} />
                    </div>
                  )}
                </div>
                {/* Content */}
                <div className="flex-1 min-w-0 py-3 pr-1">
                  {r.theme && (
                    <span className="inline-block text-xs font-medium px-2 py-0.5 rounded-full mb-1"
                      style={{ background: "rgba(230,81,0,0.12)", color: "var(--ds-color-accent)", border: "1px solid rgba(230,81,0,0.2)" }}>
                      {r.theme}
                    </span>
                  )}
                  <p className="text-sm font-semibold leading-tight line-clamp-2"
                    style={{ color: "var(--ds-color-text-primary)", fontFamily: "Montserrat, sans-serif" }}>
                    {r.title}
                  </p>
                  {r.duration && (
                    <p className="text-xs mt-0.5" style={{ color: "var(--ds-color-text-secondary)" }}>
                      {r.duration}
                    </p>
                  )}
                </div>
                {/* CTA */}
                <div className="pr-3 flex-shrink-0">
                  <span className="text-xs font-semibold flex items-center gap-1"
                    style={{ color: "var(--ds-color-accent)" }}>
                    Explorar roteiro completo
                    <ArrowRight size={12} />
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Continue Explorando Holambra ──────────────────────────────────────────── */

function ContinueExplorando({
  matchingRoutes,
  categoryName,
  categorySlug,
}: {
  matchingRoutes: any[];
  categoryName?: string;
  categorySlug?: string | null;
}) {
  const hasRoutes = matchingRoutes.length > 0;
  const routeLink =
    matchingRoutes.length === 1
      ? `/app/roteiro/${matchingRoutes[0].id}`
      : "/app/roteiros";

  const categoryLink = categorySlug ? `/app/explorar/${categorySlug}` : "/app/explorar";

  return (
    <div
      className="rounded-2xl px-4 py-5 mb-4"
      style={{
        background: "linear-gradient(135deg, rgba(0,37,26,0.9) 0%, rgba(0,60,42,0.7) 100%)",
        border: "1px solid rgba(230,81,0,0.2)",
      }}
    >
      <div className="flex items-center gap-2 mb-1">
        <Compass size={14} style={{ color: "var(--ds-color-accent)" }} />
        <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--ds-color-accent)" }}>
          Continue Explorando Holambra
        </p>
      </div>
      <p className="text-sm mb-4" style={{ color: "var(--ds-color-text-secondary)", lineHeight: 1.5 }}>
        Descubra mais experiências únicas na cidade das flores.
      </p>

      <div className="flex flex-col gap-2">
        {hasRoutes && (
          <Link to={routeLink} style={{ textDecoration: "none" }}>
            <div
              className="flex items-center justify-between px-4 py-3 rounded-xl"
              style={{ background: "var(--ds-color-accent)", color: "#fff" }}
            >
              <span className="text-sm font-semibold">
                {matchingRoutes.length === 1
                  ? `Explorar roteiro: ${matchingRoutes[0].title}`
                  : "Explorar roteiros com este lugar"}
              </span>
              <ArrowRight size={14} />
            </div>
          </Link>
        )}

        {categoryName && (
          <Link to={categoryLink} style={{ textDecoration: "none" }}>
            <div
              className="flex items-center justify-between px-4 py-3 rounded-xl"
              style={{
                background: "transparent",
                border: "1px solid rgba(230,81,0,0.3)",
                color: "var(--ds-color-accent)",
              }}
            >
              <span className="text-sm font-semibold">Explorar mais {categoryName}</span>
              <ArrowRight size={14} />
            </div>
          </Link>
        )}

        <Link to="/mapa" style={{ textDecoration: "none" }}>
          <div
            className="flex items-center justify-between px-4 py-3 rounded-xl"
            style={{
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "var(--ds-color-text-secondary)",
            }}
          >
            <span className="text-sm font-medium">Ver todos no mapa</span>
            <ArrowRight size={14} />
          </div>
        </Link>
      </div>
    </div>
  );
}

/* ─── Place Detail Page ─────────────────────────────────────────────────────── */

export default function PlaceDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const placeId = Number(id) || 0;

  function goToLogin() {
    sessionStorage.setItem("oranje_auth_return", window.location.pathname);
    navigate("/app/login");
  }

  const { data: placeData, isLoading, error, refetch } = trpc.places.byId.useQuery(
    { id: placeId },
    { enabled: !!placeId, staleTime: 30_000, retry: 1 }
  );

  const favoritesQuery = trpc.favorites.list.useQuery(undefined, {
    enabled: !!user, staleTime: 30_000, retry: 1,
  });
  const favoriteIds = new Set(
    (favoritesQuery.data ?? []).map((f: { placeId: number }) => f.placeId)
  );

  const { data: allRoutes } = trpc.routes.public.useQuery(undefined, { staleTime: 60_000 });
  const matchingRoutes = (allRoutes ?? []).filter((r: any) => {
    const ids: number[] = Array.isArray(r.placeIds) ? r.placeIds : [];
    return ids.includes(placeId);
  });
  const addFavoriteMutation = trpc.favorites.add.useMutation({
    onSuccess: () => favoritesQuery.refetch(),
  });
  const removeFavoriteMutation = trpc.favorites.remove.useMutation({
    onSuccess: () => favoritesQuery.refetch(),
  });

  const reviewsQuery = trpc.reviews.listByPlace.useQuery(
    { placeId }, { enabled: !!placeId, staleTime: 30_000, retry: 1 }
  );
  const placeReviews = reviewsQuery.data ?? [];
  const createReviewMutation = trpc.reviews.create.useMutation();
  const markHelpfulMutation = trpc.reviews.markHelpful.useMutation();
  const [, setReviewKey] = useState(0);
  const [showDirections, setShowDirections] = useState(false);

  const place = placeData as any;
  const isFavorite = favoriteIds.has(placeId);

  function handleToggleFavorite() {
    if (!user) { goToLogin(); return; }
    if (isFavorite) removeFavoriteMutation.mutate({ placeId });
    else addFavoriteMutation.mutate({ placeId });
  }

  function handleShare() {
    const shareUrl = `${window.location.origin}${window.location.pathname}${window.location.hash}`;
    if (navigator.share) navigator.share({ title: place?.name, url: shareUrl });
    else navigator.clipboard.writeText(shareUrl).catch(() => {});
  }

  /* ── SEO effect ── */
  useEffect(() => {
    if (!place) return;
    const siteName = "ORANJE — Guia Cultural de Holambra";
    const placeUrl = `${window.location.origin}/app/lugar/${place.id}`;
    const description = place.shortDesc || place.longDesc || `Conheça ${place.name} em Holambra, SP.`;
    const rawCover = (!isBlockedCoverUrl(place.coverImage || "") && place.coverImage) || "";
    const image = rawCover || (Array.isArray(place.images) ? (place.images.find((u: string) => u && !isBlockedCoverUrl(u)) ?? "") : "") || "";
    document.title = `${place.name} — ${siteName}`;

    const setMeta = (property: string, content: string, attr = "property") => {
      let tag = document.querySelector(`meta[${attr}="${property}"]`);
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute(attr, property);
        document.head.appendChild(tag);
      }
      tag.setAttribute("content", content);
    };

    setMeta("og:title", place.name);
    setMeta("og:description", description);
    setMeta("og:type", "place");
    setMeta("og:url", placeUrl);
    setMeta("og:site_name", siteName);
    if (image) setMeta("og:image", image);

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", placeUrl);

    const SCHEMA_TYPE: Record<number, string> = {
      1: "Restaurant", 2: "CafeOrCoffeeShop", 3: "BarOrPub",
      4: "TouristAttraction", 5: "LodgingBusiness", 6: "Store",
      13: "Restaurant", 14: "BarOrPub", 15: "Hotel", 16: "Park", 17: "Bakery",
    };
    const schemaType = SCHEMA_TYPE[place.categoryId] || "LocalBusiness";
    const schema: Record<string, unknown> = {
      "@context": "https://schema.org",
      "@type": schemaType,
      name: place.name,
      description,
      url: placeUrl,
      address: {
        "@type": "PostalAddress",
        streetAddress: place.address || "",
        addressLocality: place.city || "Holambra",
        addressRegion: place.state || "SP",
        addressCountry: "BR",
      },
    };
    if (place.lat && place.lng) schema.geo = { "@type": "GeoCoordinates", latitude: place.lat, longitude: place.lng };
    if (place.phone || place.whatsapp) schema.telephone = place.phone || place.whatsapp;
    if (place.website) schema.sameAs = place.website;
    if (image) schema.image = image;
    if (place.rating && place.reviewCount) {
      schema.aggregateRating = {
        "@type": "AggregateRating",
        ratingValue: place.rating,
        reviewCount: place.reviewCount,
        bestRating: 5, worstRating: 1,
      };
    }
    let schemaTag = document.querySelector('script[data-oranje="place"]');
    if (!schemaTag) {
      schemaTag = document.createElement("script");
      schemaTag.setAttribute("type", "application/ld+json");
      schemaTag.setAttribute("data-oranje", "place");
      document.head.appendChild(schemaTag);
    }
    schemaTag.textContent = JSON.stringify(schema);
    return () => { document.title = siteName; };
  }, [place]);

  function handleReviewSubmit(rating: number, comment: string) {
    if (!user) { goToLogin(); return; }
    createReviewMutation.mutate(
      { placeId, rating, comment },
      { onSuccess: () => { setReviewKey(k => k + 1); reviewsQuery.refetch(); } }
    );
  }

  function handleMarkHelpful(reviewId: number) {
    markHelpfulMutation.mutate(reviewId, { onSuccess: () => reviewsQuery.refetch() });
  }

  /* ── Loading ── */
  if (isLoading) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--ds-color-bg-primary)" }}>
        <OranjeHeader showBack title="Carregando..." />
        <div style={{ paddingBottom: 80 }}>
          <div className="w-full animate-pulse" style={{ height: 300, background: "var(--ds-color-bg-secondary)" }} />
          <div className="px-4 py-6 space-y-4">
            <div className="animate-pulse rounded" style={{ height: 14, width: "40%", background: "var(--ds-color-bg-secondary)" }} />
            <div className="animate-pulse rounded" style={{ height: 28, width: "70%", background: "var(--ds-color-bg-secondary)" }} />
            <div className="space-y-2 pt-1">
              <div className="animate-pulse rounded" style={{ height: 14, background: "var(--ds-color-bg-secondary)" }} />
              <div className="animate-pulse rounded" style={{ height: 14, width: "80%", background: "var(--ds-color-bg-secondary)" }} />
            </div>
          </div>
        </div>
        <TabBar />
      </div>
    );
  }

  /* ── Error ── */
  if (error && !place) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--ds-color-bg-primary)" }} className="flex flex-col">
        <OranjeHeader showBack title="Erro ao carregar" />
        <div className="flex-1 px-4 flex flex-col items-center justify-center">
          <RefreshCw size={48} style={{ color: "var(--ds-color-accent)" }} className="mb-4" />
          <h2 className="text-xl font-bold text-center mb-2" style={{ color: "var(--ds-color-text-primary)" }}>
            Erro ao carregar
          </h2>
          <p className="text-sm text-center mb-6" style={{ color: "var(--ds-color-text-secondary)" }}>
            Não foi possível carregar este lugar. Verifique sua conexão.
          </p>
          <div className="flex gap-3">
            <DSButton variant="primary" onClick={() => refetch()}>Tentar novamente</DSButton>
            <Link to="/app"><DSButton variant="secondary">Voltar à Home</DSButton></Link>
          </div>
        </div>
        <TabBar />
      </div>
    );
  }

  /* ── Not found ── */
  if (!place) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--ds-color-bg-primary)" }} className="flex flex-col">
        <OranjeHeader showBack title="Lugar não encontrado" />
        <div className="flex-1 px-4 flex flex-col items-center justify-center">
          <AlertCircle size={48} style={{ color: "var(--ds-color-accent)" }} className="mb-4" />
          <h2 className="text-xl font-bold text-center mb-2" style={{ color: "var(--ds-color-text-primary)" }}>
            Lugar não encontrado
          </h2>
          <p className="text-sm text-center mb-6" style={{ color: "var(--ds-color-text-secondary)" }}>
            Desculpe, não encontramos este lugar.
          </p>
          <Link to="/app"><DSButton variant="primary">Voltar à Home</DSButton></Link>
        </div>
        <TabBar />
      </div>
    );
  }

  /* ── Derived data ── */
  const allImages = getAllPlaceImages({
    name: place.name,
    coverImage: place.coverImage,
    images: place.images,
    categoryName: place.categoryName,
  });
  if (place.photos && Array.isArray(place.photos)) {
    for (const photo of place.photos) {
      if (photo.url && !allImages.includes(photo.url)) allImages.push(photo.url);
    }
  }

  const tags: string[] = Array.isArray(place.tags) ? place.tags : [];

  // Highlight tags: curated ones shown at top as "quick reads"
  const HIGHLIGHT_TAG_KEYS = [
    "curadoria_oranje", "primeira_visita", "roteiro_1_dia", "roteiro_cultura",
    "roteiro_romantico", "gratuito", "fotos", "casal", "familia", "kids", "criancas",
    "pet_friendly", "historico", "icone",
  ];
  const highlightTags = tags.filter(t => HIGHLIGHT_TAG_KEYS.includes(t));
  const detailTags = tags.filter(t => !HIGHLIGHT_TAG_KEYS.includes(t));
  const allDisplayTags = [...highlightTags, ...detailTags];

  const mapsUrl = place.lat && place.lng
    ? `https://www.google.com/maps/search/${place.lat},${place.lng}`
    : place.mapsUrl || null;

  const hasAddress = !!(place.address && place.address.toLowerCase() !== "holambra – sp" && place.address !== "Centro, Holambra – SP");
  const hasMapLink = !!(mapsUrl);

  const phoneUrl = place.phone ? `tel:${place.phone.replace(/\s/g, "")}` : null;
  const whatsappUrl = place.whatsapp
    ? `https://wa.me/${place.whatsapp.replace(/\D/g, "")}?text=Olá%20${encodeURIComponent(place.name)}%2C%20vim%20pelo%20Oranje`
    : null;
  const instagramUrl = place.instagram
    ? `https://instagram.com/${place.instagram.replace("@", "")}`
    : null;
  const hasContact = !!(phoneUrl || whatsappUrl || instagramUrl || place.website);
  const hasHours = !!place.openingHours;

  /* ── RENDER ── */
  return (
    <div style={{ minHeight: "100vh", background: "var(--ds-color-bg-primary)" }}>
      <OranjeHeader showBack title={place.name} />

      {/* ─────────────────────────────────────────────────────────── */}
      {/* M1: Hero + Gallery                                          */}
      {/* ─────────────────────────────────────────────────────────── */}
      <ImageGallery
        images={allImages}
        placeName={place.name}
        isFavorite={isFavorite}
        onFavorite={handleToggleFavorite}
        onShare={handleShare}
        isFeatured={place.isFeatured}
        isRecommended={place.isRecommended}
        dataPending={place.dataPending}
        rating={place.rating}
        reviewCount={place.reviewCount}
      />

      <div className="px-4" style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>

        {/* ─────────────────────────────────────────────────────────── */}
        {/* M2: Identity — category + name + badges                    */}
        {/* ─────────────────────────────────────────────────────────── */}
        <div className="pt-5 mb-4">
          {/* Category label */}
          {place.categoryName && (
            <div className="flex items-center gap-1.5 mb-2">
              <span
                className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full"
                style={{
                  background: "rgba(230,81,0,0.1)",
                  color: "var(--ds-color-accent)",
                  border: "1px solid rgba(230,81,0,0.2)",
                }}
              >
                {CATEGORY_ICON[place.categoryId] || <Leaf size={12} />}
                {place.categoryName}
              </span>
              {place.isPartner && (
                <span
                  className="inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    color: "var(--ds-color-text-secondary)",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  Parceiro
                </span>
              )}
            </div>
          )}

          {/* Name */}
          <h1
            className="text-2xl font-bold leading-tight mb-2"
            style={{ color: "var(--ds-color-text-primary)", fontFamily: "Montserrat, sans-serif" }}
          >
            {place.name}
          </h1>

          {/* Quick status row: price + hours badge */}
          {(place.priceRange || hasHours) && (
            <div className="flex flex-wrap items-center gap-2 mb-1">
              {place.priceRange && (
                <span
                  className="text-xs font-semibold px-2.5 py-1 rounded-full"
                  style={{
                    background: "rgba(230,81,0,0.1)",
                    color: "var(--ds-color-accent)",
                    border: "1px solid rgba(230,81,0,0.22)",
                  }}
                >
                  {place.priceRange}
                  {PRICE_LABEL[place.priceRange] ? ` · ${PRICE_LABEL[place.priceRange]}` : ""}
                </span>
              )}
              {hasHours && <HoursStatusBadge openingHours={place.openingHours} />}
              {place.isFree && !place.priceRange && (
                <span
                  className="text-xs font-semibold px-2.5 py-1 rounded-full"
                  style={{
                    background: "rgba(34,197,94,0.1)",
                    color: "#22c55e",
                    border: "1px solid rgba(34,197,94,0.25)",
                  }}
                >
                  Entrada gratuita
                </span>
              )}
            </div>
          )}

          {/* Highlight tags: quick-read pills */}
          {highlightTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {highlightTags.map(t => (
                <span
                  key={t}
                  className="text-xs px-2.5 py-1 rounded-full font-medium"
                  style={{
                    background: t === "curadoria_oranje"
                      ? "rgba(230,81,0,0.14)"
                      : "rgba(255,255,255,0.06)",
                    color: t === "curadoria_oranje"
                      ? "var(--ds-color-accent)"
                      : "var(--ds-color-text-secondary)",
                    border: `1px solid ${t === "curadoria_oranje" ? "rgba(230,81,0,0.25)" : "rgba(255,255,255,0.1)"}`,
                  }}
                >
                  {TAG_LABELS[t] || t.replace(/_/g, " ")}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* ─────────────────────────────────────────────────────────── */}
        {/* M3: Editorial description (shortDesc)                      */}
        {/* ─────────────────────────────────────────────────────────── */}
        {place.shortDesc && (
          <>
            <SectionDivider />
            <p
              className="text-sm leading-relaxed"
              style={{ color: "var(--ds-color-accent)", opacity: 0.9, lineHeight: "1.75" }}
            >
              {place.shortDesc}
            </p>
          </>
        )}

        {/* ─────────────────────────────────────────────────────────── */}
        {/* M4: Address + "Como chegar" CTA                            */}
        {/* ─────────────────────────────────────────────────────────── */}
        {(hasAddress || hasMapLink) && (
          <>
            <SectionDivider />
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2 flex-1 min-w-0">
                <MapPin size={14} style={{ color: "var(--ds-color-accent)", flexShrink: 0, marginTop: 2, opacity: 0.8 }} />
                <p className="text-sm leading-relaxed" style={{ color: "var(--ds-color-text-secondary)" }}>
                  {hasAddress ? place.address : "Holambra, SP"}
                </p>
              </div>
              {(hasMapLink || hasAddress) && (
                <button
                  onClick={() => setShowDirections(true)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold flex-shrink-0"
                  style={{
                    background: "var(--ds-color-accent)",
                    color: "#fff",
                    whiteSpace: "nowrap",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  <Navigation size={12} />
                  Como chegar
                </button>
              )}
            </div>
          </>
        )}

        {/* ─────────────────────────────────────────────────────────── */}
        {/* M5: Contact — phone / WhatsApp / Instagram / website       */}
        {/* ─────────────────────────────────────────────────────────── */}
        {hasContact && (
          <>
            <SectionDivider />
            <SectionTitle icon={<Phone size={14} />} title="Contato" />
            <div className="grid grid-cols-2 gap-2.5">

              {phoneUrl && (
                <a href={phoneUrl} target="_self"
                  className="flex items-center justify-center gap-2 px-3 py-3 rounded-xl text-sm font-semibold no-underline"
                  style={{ background: "var(--ds-color-accent)", color: "#fff" }}>
                  <Phone size={14} />
                  Ligar
                </a>
              )}

              {whatsappUrl && (
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-3 py-3 rounded-xl text-sm font-semibold no-underline"
                  style={{ background: "var(--ds-color-accent)", color: "#fff" }}>
                  <MessageCircle size={14} />
                  WhatsApp
                </a>
              )}

              {instagramUrl && (
                <a href={instagramUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-3 py-3 rounded-xl text-sm font-semibold no-underline"
                  style={{
                    background: "transparent", color: "var(--ds-color-accent)",
                    border: "1px solid rgba(230,81,0,0.35)",
                  }}>
                  <Instagram size={14} />
                  Instagram
                </a>
              )}

              {place.website && (
                <a href={place.website} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-3 py-3 rounded-xl text-sm font-semibold no-underline"
                  style={{
                    background: "transparent", color: "var(--ds-color-accent)",
                    border: "1px solid rgba(230,81,0,0.35)",
                  }}>
                  <Globe size={14} />
                  Site oficial
                </a>
              )}
            </div>
          </>
        )}

        {/* ─────────────────────────────────────────────────────────── */}
        {/* M6: Opening hours + weekly schedule                        */}
        {/* ─────────────────────────────────────────────────────────── */}
        {hasHours && (
          <>
            <SectionDivider />
            <WeeklySchedule openingHours={place.openingHours} />
          </>
        )}

        {/* ─────────────────────────────────────────────────────────── */}
        {/* M7-A: Long description — editorial/about                   */}
        {/* ─────────────────────────────────────────────────────────── */}
        {place.longDesc && (
          <>
            <SectionDivider />
            <SectionTitle title="Sobre" />
            <p className="text-sm leading-relaxed" style={{ color: "var(--ds-color-text-secondary)", lineHeight: "1.75" }}>
              {place.longDesc}
            </p>
          </>
        )}

        {/* ─────────────────────────────────────────────────────────── */}
        {/* M8: Ideal para (detail tags)                               */}
        {/* ─────────────────────────────────────────────────────────── */}
        {allDisplayTags.length > 0 && (
          <>
            <SectionDivider />
            <SectionTitle title="Ideal para" />
            <div className="flex flex-wrap gap-2">
              {allDisplayTags.map((tag, idx) => (
                <span
                  key={idx}
                  className="text-xs px-3 py-1.5 rounded-full font-medium capitalize"
                  style={{
                    background: "rgba(230,81,0,0.07)",
                    color: "var(--ds-color-text-secondary)",
                    border: "1px solid rgba(230,81,0,0.14)",
                  }}
                >
                  {TAG_LABELS[tag] || tag.replace(/_/g, " ")}
                </span>
              ))}
            </div>
          </>
        )}

        {/* ─────────────────────────────────────────────────────────── */}
        {/* M11: In which routes (roteiros)                            */}
        {/* ─────────────────────────────────────────────────────────── */}
        <RoutesBlock matching={matchingRoutes} />

        {/* ─────────────────────────────────────────────────────────── */}
        {/* M10: Related places (same category)                        */}
        {/* ─────────────────────────────────────────────────────────── */}
        {place.categoryId && (
          <RelatedPlacesBlock
            categoryId={place.categoryId}
            categoryName={place.categoryName}
            excludeId={placeId}
          />
        )}

        {/* ─────────────────────────────────────────────────────────── */}
        {/* Reviews                                                     */}
        {/* ─────────────────────────────────────────────────────────── */}
        <SectionDivider />
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <SectionTitle icon={<Star size={14} />} title="Avaliações" />
            {place.rating && place.rating > 0 ? (
              <div className="flex items-center gap-1">
                <Star size={13} fill="var(--ds-color-accent)" color="var(--ds-color-accent)" />
                <span className="text-sm font-semibold" style={{ color: "var(--ds-color-accent)" }}>
                  {place.rating.toFixed(1)}
                </span>
                {place.reviewCount ? (
                  <span className="text-xs" style={{ color: "var(--ds-color-text-secondary)" }}>
                    ({place.reviewCount.toLocaleString("pt-BR")})
                  </span>
                ) : null}
              </div>
            ) : null}
          </div>

          <ReviewForm
            onSubmit={handleReviewSubmit}
            isAuthenticated={!!user}
            onLoginClick={goToLogin}
          />

          {placeReviews && placeReviews.length > 0 ? (
            <div className="mt-3">
              {placeReviews.map((review: any) => (
                <ReviewCard
                  key={review.id}
                  review={{
                    id: review.id,
                    author: review.userName || "Usuário",
                    rating: review.rating,
                    comment: review.comment,
                    date: review.createdAt ? new Date(review.createdAt).toLocaleDateString("pt-BR") : "",
                    helpful: review.helpfulCount || 0,
                    isVerified: review.isVerified,
                  }}
                  onHelpful={handleMarkHelpful}
                />
              ))}
            </div>
          ) : (
            <div
              className="p-4 text-center rounded-2xl mt-3"
              style={{ background: "rgba(230,81,0,0.05)", border: "1px solid rgba(230,81,0,0.1)" }}
            >
              <p className="text-sm font-medium mb-0.5" style={{ color: "var(--ds-color-text-primary)" }}>
                Nenhuma avaliação ainda
              </p>
              <p className="text-xs" style={{ color: "var(--ds-color-text-secondary)" }}>
                Seja o primeiro a avaliar este lugar.
              </p>
            </div>
          )}
        </div>

        {/* ─────────────────────────────────────────────────────────── */}
        {/* dataPending footnote — only if data is incomplete          */}
        {/* ─────────────────────────────────────────────────────────── */}
        {place.dataPending ? (
          <div
            className="flex items-start gap-2 px-3 py-2.5 rounded-xl mb-4"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <Info size={12} style={{ color: "var(--ds-color-text-secondary)", flexShrink: 0, marginTop: 1, opacity: 0.6 }} />
            <p className="text-xs" style={{ color: "var(--ds-color-text-secondary)", opacity: 0.55, lineHeight: 1.5 }}>
              Algumas informações ainda estão sendo verificadas. Horários e contatos podem estar incompletos.
            </p>
          </div>
        ) : null}

        {/* ─────────────────────────────────────────────────────────── */}
        {/* Continue Explorando Holambra                               */}
        {/* ─────────────────────────────────────────────────────────── */}
        <ContinueExplorando
          matchingRoutes={matchingRoutes}
          categoryName={place.categoryName}
          categorySlug={place.categorySlug}
        />

      </div>

      <div style={{ height: 100 }} />
      <TabBar />

      {showDirections && (
        <DirectionsSheet
          name={place.name}
          address={place.address || null}
          lat={place.lat ?? null}
          lng={place.lng ?? null}
          onClose={() => setShowDirections(false)}
        />
      )}
    </div>
  );
}
