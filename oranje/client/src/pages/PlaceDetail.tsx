import { useState, useRef, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { OranjeHeader } from "@/components/OranjeHeader";
import { TabBar } from "@/components/TabBar";
import { trpc } from "@/lib/trpc";
import {
  MapPin, Phone, Globe, Instagram, AlertCircle, Heart, Share2,
  Star, RefreshCw, ChevronLeft, ChevronRight, Clock, Info,
} from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { ReviewCard } from "@/components/ReviewCard";
import { ReviewForm } from "@/components/ReviewForm";
import { DSButton, DSBadge } from "@/components/ds";
import { getAllPlaceImages } from "@/components/PlaceCard";
import { useBusinessHours, getBusinessStatus } from "@/hooks/useBusinessHours";

/* ─── Constants ─────────────────────────────────────────────────────────────── */

const TAG_LABELS: Record<string, string> = {
  tipico_holandes: "Típico Holandês",
  cafe_da_manha: "Café da Manhã",
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
  hotel: "Hotel",
  eventos: "Eventos",
  parque: "Parque",
  flores: "Flores",
  gratuito: "Gratuito",
  kids: "Para crianças",
  passeio: "Passeio",
  icone: "Ícone da cidade",
  classico: "Clássico",
  primeira_visita: "1ª visita",
  curadoria_oranje: "Curadoria Oranje",
  roteiro_1_dia: "Roteiro de 1 dia",
  tradicional: "Tradicional",
  historico: "Histórico",
  almoco_jantar: "Almoço e jantar",
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

function formatInterval(open: string, close: string): string {
  const fmt = (t: string) => {
    const [h, m] = t.split(":");
    return m === "00" ? `${h}h` : `${h}h${m}`;
  };
  return `${fmt(open)} – ${fmt(close)}`;
}

/* ─── Image Gallery ─────────────────────────────────────────────────────────── */

function ImageGallery({ images, placeName }: { images: string[]; placeName: string }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imgErrors, setImgErrors] = useState<Set<number>>(new Set());
  const scrollRef = useRef<HTMLDivElement>(null);

  const validImages = images.filter((_, i) => !imgErrors.has(i));
  const showNavigation = validImages.length > 1;

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
        style={{ display: "flex", height: "100%" }}
      >
        {images.map((src, i) => (
          <div
            key={i}
            style={{
              flex: "0 0 100%",
              scrollSnapAlign: "start",
              height: "100%",
              display: imgErrors.has(i) ? "none" : "block",
            }}
          >
            <img
              src={src}
              alt={`${placeName} - Foto ${i + 1}`}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              loading={i === 0 ? "eager" : "lazy"}
              onError={() => setImgErrors(prev => new Set(prev).add(i))}
            />
          </div>
        ))}
      </div>

      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "linear-gradient(to top, rgba(0,37,26,0.7), transparent 60%)" }}
      />

      {showNavigation && (
        <>
          <button
            onClick={() => goTo(Math.max(0, currentIndex - 1))}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full items-center justify-center"
            style={{
              background: "rgba(0,37,26,0.6)",
              backdropFilter: "blur(4px)",
              display: currentIndex === 0 ? "none" : "flex",
            }}
          >
            <ChevronLeft size={16} color="#fff" />
          </button>
          <button
            onClick={() => goTo(Math.min(validImages.length - 1, currentIndex + 1))}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full items-center justify-center"
            style={{
              background: "rgba(0,37,26,0.6)",
              backdropFilter: "blur(4px)",
              display: currentIndex >= validImages.length - 1 ? "none" : "flex",
            }}
          >
            <ChevronRight size={16} color="#fff" />
          </button>
        </>
      )}

      {showNavigation && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5" style={{ zIndex: 2 }}>
          {validImages.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              style={{
                width: i === currentIndex ? 16 : 6,
                height: 6,
                borderRadius: 3,
                background: i === currentIndex ? "var(--ds-color-accent)" : "rgba(255,255,255,0.5)",
                border: "none",
                padding: 0,
                transition: "all 0.2s ease",
              }}
            />
          ))}
        </div>
      )}

      {showNavigation && (
        <div
          className="absolute bottom-3 right-3 px-2 py-1 rounded-full text-xs font-medium"
          style={{ background: "rgba(0,37,26,0.6)", color: "#fff", backdropFilter: "blur(4px)", zIndex: 2 }}
        >
          {currentIndex + 1}/{validImages.length}
        </div>
      )}
    </div>
  );
}

/* ─── Hours Status Badge ─────────────────────────────────────────────────────── */

function HoursStatusBadge({ openingHours }: { openingHours: string | null | undefined }) {
  const { status, label } = useBusinessHours(openingHours);
  if (!label) return null;

  const isOpen = status?.type === "open" || status?.type === "closes_soon";
  const isWarn = status?.type === "closes_soon";

  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
      style={{
        background: isWarn ? "rgba(230,81,0,0.15)" : isOpen ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.08)",
        color: isWarn ? "var(--ds-color-accent)" : isOpen ? "#22c55e" : "var(--ds-color-text-secondary)",
        border: `1px solid ${isWarn ? "rgba(230,81,0,0.3)" : isOpen ? "rgba(34,197,94,0.3)" : "rgba(255,255,255,0.12)"}`,
      }}
    >
      <Clock size={10} />
      {label}
    </span>
  );
}

/* ─── Weekly Schedule Table ──────────────────────────────────────────────────── */

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

  const todayStatus = getBusinessStatus(openingHours);
  const nowDayPt = (() => {
    const tz = "America/Sao_Paulo";
    const wd = new Intl.DateTimeFormat("en-US", { timeZone: tz, weekday: "short" }).format(new Date());
    const map: Record<string, string> = {
      Sun: "dom", Mon: "seg", Tue: "ter", Wed: "qua", Thu: "qui", Fri: "sex", Sat: "sab",
    };
    return map[wd] ?? "";
  })();

  const hasAnyData = DAY_ORDER.some(d => d in schedule);
  if (!hasAnyData) return null;

  return (
    <div className="mb-6">
      <h2 className="text-base font-bold mb-3" style={{ color: "var(--ds-color-text-primary)", fontFamily: "Montserrat, sans-serif" }}>
        Funcionamento
      </h2>
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
                background: isToday ? "rgba(230,81,0,0.08)" : idx % 2 === 0 ? "rgba(255,255,255,0.03)" : "transparent",
                borderBottom: idx < DAY_ORDER.length - 1 ? "1px solid rgba(230,81,0,0.08)" : "none",
              }}
            >
              <span
                className="text-sm font-medium"
                style={{
                  color: isToday ? "var(--ds-color-accent)" : "var(--ds-color-text-primary)",
                  fontWeight: isToday ? 700 : 500,
                }}
              >
                {DAY_FULL[day]}
                {isToday && (
                  <span className="ml-1 text-xs opacity-70">(hoje)</span>
                )}
              </span>
              <span
                className="text-sm"
                style={{
                  color: isClosed
                    ? "var(--ds-color-text-secondary)"
                    : isToday
                    ? "var(--ds-color-accent)"
                    : "var(--ds-color-text-secondary)",
                  fontWeight: isToday && !isClosed ? 600 : 400,
                  opacity: isClosed ? 0.5 : 1,
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

/* ─── Place Detail Page ─────────────────────────────────────────────────────── */

export default function PlaceDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const placeId = Number(id) || 0;

  const { data: placeData, isLoading, error, refetch } = trpc.places.byId.useQuery(
    { id: placeId },
    { enabled: !!placeId, staleTime: 30_000, retry: 1 }
  );

  const favoritesQuery = trpc.favorites.list.useQuery(undefined, {
    enabled: !!user,
    staleTime: 30_000,
    retry: 1,
  });
  const favoriteIds = new Set(
    (favoritesQuery.data ?? []).map((f: { placeId: number }) => f.placeId)
  );
  const addFavoriteMutation = trpc.favorites.add.useMutation({
    onSuccess: () => favoritesQuery.refetch(),
  });
  const removeFavoriteMutation = trpc.favorites.remove.useMutation({
    onSuccess: () => favoritesQuery.refetch(),
  });

  const reviewsQuery = trpc.reviews.listByPlace.useQuery(
    { placeId },
    { enabled: !!placeId, staleTime: 30_000, retry: 1 }
  );
  const placeReviews = reviewsQuery.data ?? [];
  const refetchReviews = reviewsQuery.refetch;
  const createReviewMutation = trpc.reviews.create.useMutation();
  const markHelpfulMutation = trpc.reviews.markHelpful.useMutation();
  const [, setReviewKey] = useState(0);

  const place = placeData as any;
  const isFavorite = favoriteIds.has(placeId);

  function handleToggleFavorite() {
    if (!user) { window.open(getLoginUrl(), "_blank"); return; }
    if (isFavorite) removeFavoriteMutation.mutate({ placeId });
    else addFavoriteMutation.mutate({ placeId });
  }

  function handleShare() {
    const shareUrl = `${window.location.origin}${window.location.pathname}${window.location.hash}`;
    if (navigator.share) navigator.share({ title: place?.name, url: shareUrl });
    else navigator.clipboard.writeText(shareUrl);
  }

  useEffect(() => {
    if (!place) return;
    const siteName = "ORANJE — Guia Cultural de Holambra";
    const placeUrl = `${window.location.origin}/app/lugar/${place.id}`;
    const description = place.shortDesc || place.longDesc || `Conheça ${place.name} em Holambra, SP.`;
    const image = place.coverImage || (Array.isArray(place.images) ? place.images[0] : "") || "";
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
    if (place.website) schema.url = place.website;
    if (image) schema.image = image;
    if (place.rating && place.reviewCount) {
      schema.aggregateRating = {
        "@type": "AggregateRating",
        ratingValue: place.rating,
        reviewCount: place.reviewCount,
        bestRating: 5,
        worstRating: 1,
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
    if (!user) { window.open(getLoginUrl(), "_blank"); return; }
    createReviewMutation.mutate(
      { placeId, rating, comment },
      { onSuccess: () => { setReviewKey(k => k + 1); refetchReviews(); } }
    );
  }

  function handleMarkHelpful(reviewId: number) {
    markHelpfulMutation.mutate(reviewId, { onSuccess: () => refetchReviews() });
  }

  /* ── Loading State ── */
  if (isLoading) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--ds-color-bg-primary)" }}>
        <OranjeHeader showBack title="Carregando..." />
        <div style={{ paddingBottom: 80 }}>
          <div className="w-full animate-pulse" style={{ height: 300, background: "var(--ds-color-bg-secondary)" }} />
          <div className="px-4 py-6 space-y-4">
            <div className="animate-pulse rounded-lg" style={{ height: 32, width: "75%", background: "var(--ds-color-bg-secondary)" }} />
            <div className="space-y-2">
              <div className="animate-pulse rounded-lg" style={{ height: 16, background: "var(--ds-color-bg-secondary)" }} />
              <div className="animate-pulse rounded-lg" style={{ height: 16, width: "83%", background: "var(--ds-color-bg-secondary)" }} />
            </div>
          </div>
        </div>
        <div style={{ height: 100 }} />
        <TabBar />
      </div>
    );
  }

  /* ── Error State ── */
  if (error && !place) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--ds-color-bg-primary)" }} className="flex flex-col">
        <OranjeHeader showBack title="Erro ao carregar" />
        <div className="flex-1 px-4 flex flex-col items-center justify-center">
          <RefreshCw size={48} style={{ color: "var(--ds-color-accent)" }} className="mb-4" />
          <h2 className="text-xl font-bold text-center mb-2" style={{ color: "var(--ds-color-text-primary)" }}>Erro ao carregar</h2>
          <p className="text-sm text-center mb-6" style={{ color: "var(--ds-color-text-secondary)" }}>
            Não foi possível carregar este lugar. Verifique sua conexão e tente novamente.
          </p>
          <div className="flex gap-3">
            <DSButton variant="primary" onClick={() => refetch()}>Tentar novamente</DSButton>
            <Link to="/app"><DSButton variant="secondary">Voltar à Home</DSButton></Link>
          </div>
        </div>
        <div style={{ height: 100 }} />
        <TabBar />
      </div>
    );
  }

  /* ── Not Found ── */
  if (!place) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--ds-color-bg-primary)" }} className="flex flex-col">
        <OranjeHeader showBack title="Lugar não encontrado" />
        <div className="flex-1 px-4 flex flex-col items-center justify-center">
          <AlertCircle size={48} style={{ color: "var(--ds-color-accent)" }} className="mb-4" />
          <h2 className="text-xl font-bold text-center mb-2" style={{ color: "var(--ds-color-text-primary)" }}>Lugar não encontrado</h2>
          <p className="text-sm text-center mb-6" style={{ color: "var(--ds-color-text-secondary)" }}>
            Desculpe, não conseguimos encontrar este lugar.
          </p>
          <Link to="/app"><DSButton variant="primary">Voltar à Home</DSButton></Link>
        </div>
        <div style={{ height: 100 }} />
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

  const phoneUrl = place.phone ? `tel:${place.phone.replace(/\s/g, "")}` : null;
  const whatsappUrl = place.whatsapp
    ? `https://wa.me/${place.whatsapp.replace(/\D/g, "")}?text=Olá%20${encodeURIComponent(place.name)}%2C%20gostaria%20de%20informações`
    : null;
  const instagramUrl = place.instagram ? `https://instagram.com/${place.instagram.replace("@", "")}` : null;
  const mapsUrl = place.lat && place.lng
    ? `https://www.google.com/maps/search/${place.lat},${place.lng}`
    : place.mapsUrl || null;

  const tags: string[] = Array.isArray(place.tags) ? place.tags : [];
  const prettyTags = tags.map(t => TAG_LABELS[t] || t.replace(/_/g, " "));

  const contactButtons = [
    phoneUrl && { href: phoneUrl, label: "Ligar", icon: <Phone size={15} />, primary: true },
    whatsappUrl && { href: whatsappUrl, label: "WhatsApp", icon: <Phone size={15} />, primary: true },
    instagramUrl && { href: instagramUrl, label: "Instagram", icon: <Instagram size={15} />, primary: false },
    place.website && { href: place.website, label: "Site", icon: <Globe size={15} />, primary: false },
    mapsUrl && { href: mapsUrl, label: "Como chegar", icon: <MapPin size={15} />, primary: false },
  ].filter(Boolean) as { href: string; label: string; icon: React.ReactNode; primary: boolean }[];

  const hasHours = !!place.openingHours;
  const hasContact = contactButtons.length > 0;

  /* ── Render ── */
  return (
    <div style={{ minHeight: "100vh", background: "var(--ds-color-bg-primary)" }}>
      <OranjeHeader showBack title={place.name} />

      <div style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
        {/* ── Hero ── */}
        <div className="relative">
          <ImageGallery images={allImages} placeName={place.name} />

          <div className="absolute top-4 left-4 flex flex-wrap gap-2" style={{ zIndex: 3 }}>
            {place.isFeatured && <DSBadge variant="accent">Destaque</DSBadge>}
            {place.isRecommended && !place.isFeatured && <DSBadge variant="success">★ ORANJE</DSBadge>}
          </div>

          <div className="absolute top-4 right-4 flex gap-2" style={{ zIndex: 3 }}>
            <button
              onClick={handleShare}
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: "rgba(0,37,26,0.6)", backdropFilter: "blur(8px)" }}
            >
              <Share2 size={16} style={{ color: "var(--ds-color-text-primary)" }} />
            </button>
            <button
              onClick={handleToggleFavorite}
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{
                background: isFavorite ? "rgba(230,81,0,0.9)" : "rgba(0,37,26,0.6)",
                backdropFilter: "blur(8px)",
              }}
            >
              <Heart size={16} fill={isFavorite ? "#fff" : "none"} stroke={isFavorite ? "#fff" : "var(--ds-color-text-primary)"} />
            </button>
          </div>

          {place.rating && place.rating > 0 && (
            <div
              className="absolute bottom-10 right-4 px-3 py-2 rounded-xl flex items-center gap-1"
              style={{ background: "rgba(0,37,26,0.7)", backdropFilter: "blur(8px)", zIndex: 3 }}
            >
              <span className="text-lg font-bold" style={{ color: "var(--ds-color-accent)" }}>★</span>
              <span className="text-sm font-semibold" style={{ color: "var(--ds-color-text-primary)" }}>{place.rating.toFixed(1)}</span>
              {place.reviewCount && (
                <span className="text-xs" style={{ color: "var(--ds-color-text-secondary)" }}>({place.reviewCount.toLocaleString("pt-BR")})</span>
              )}
            </div>
          )}
        </div>

        {/* ── Main Content ── */}
        <div className="px-4 py-6">

          {/* Title row */}
          <h1
            className="text-2xl font-bold mb-1 leading-tight"
            style={{ color: "var(--ds-color-text-primary)", fontFamily: "Montserrat, sans-serif" }}
          >
            {place.name}
          </h1>

          {/* Badges row: price + open status */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {place.priceRange && (
              <span
                className="text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{
                  background: "rgba(230,81,0,0.12)",
                  color: "var(--ds-color-accent)",
                  border: "1px solid rgba(230,81,0,0.25)",
                }}
              >
                {place.priceRange} · {PRICE_LABEL[place.priceRange] || ""}
              </span>
            )}
            {place.openingHours && <HoursStatusBadge openingHours={place.openingHours} />}
          </div>

          {/* Short description */}
          {place.shortDesc && (
            <p className="text-sm mb-4 leading-relaxed" style={{ color: "var(--ds-color-accent)", opacity: 0.9 }}>
              {place.shortDesc}
            </p>
          )}

          {/* Address */}
          {place.address && (
            <div className="flex items-start gap-2 mb-5">
              <MapPin size={14} style={{ color: "var(--ds-color-text-secondary)", flexShrink: 0, marginTop: 2 }} />
              <p className="text-sm" style={{ color: "var(--ds-color-text-secondary)" }}>{place.address}</p>
            </div>
          )}

          {/* dataPending notice */}
          {place.dataPending && (
            <div
              className="flex items-start gap-2 px-3 py-2.5 rounded-xl mb-5"
              style={{ background: "rgba(230,81,0,0.07)", border: "1px solid rgba(230,81,0,0.15)" }}
            >
              <Info size={14} style={{ color: "var(--ds-color-accent)", flexShrink: 0, marginTop: 1 }} />
              <p className="text-xs" style={{ color: "var(--ds-color-text-secondary)" }}>
                Algumas informações deste lugar ainda estão sendo verificadas. Horários e contatos podem estar incompletos.
              </p>
            </div>
          )}

          {/* ── Sobre ── */}
          {place.longDesc && (
            <>
              <div style={{ height: 1, background: "rgba(230,81,0,0.12)", margin: "20px 0" }} />
              <div className="mb-6">
                <h2 className="text-base font-bold mb-2" style={{ color: "var(--ds-color-text-primary)", fontFamily: "Montserrat, sans-serif" }}>
                  Sobre
                </h2>
                <p className="text-sm leading-relaxed" style={{ color: "var(--ds-color-text-secondary)", lineHeight: "1.7" }}>
                  {place.longDesc}
                </p>
              </div>
            </>
          )}

          {/* ── Horários ── */}
          {hasHours && (
            <>
              <div style={{ height: 1, background: "rgba(230,81,0,0.12)", margin: "20px 0" }} />
              <WeeklySchedule openingHours={place.openingHours} />
            </>
          )}

          {/* ── Ideal para (tags) ── */}
          {prettyTags.length > 0 && (
            <>
              <div style={{ height: 1, background: "rgba(230,81,0,0.12)", margin: "20px 0" }} />
              <div className="mb-6">
                <h2 className="text-base font-bold mb-3" style={{ color: "var(--ds-color-text-primary)", fontFamily: "Montserrat, sans-serif" }}>
                  Ideal para
                </h2>
                <div className="flex flex-wrap gap-2">
                  {prettyTags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-3 py-1.5 rounded-full font-medium capitalize"
                      style={{
                        background: "rgba(230,81,0,0.08)",
                        color: "var(--ds-color-accent)",
                        border: "1px solid rgba(230,81,0,0.18)",
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ── Contato ── */}
          {hasContact && (
            <>
              <div style={{ height: 1, background: "rgba(230,81,0,0.12)", margin: "20px 0" }} />
              <div className="mb-6">
                <h2 className="text-base font-bold mb-3" style={{ color: "var(--ds-color-text-primary)", fontFamily: "Montserrat, sans-serif" }}>
                  Contato
                </h2>
                <div className="grid grid-cols-2 gap-2.5">
                  {contactButtons.map(({ href, label, icon, primary }) => (
                    <a
                      key={label}
                      href={href}
                      target={href.startsWith("tel") ? "_self" : "_blank"}
                      rel="noopener noreferrer"
                      className="w-full px-3 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 no-underline"
                      style={{
                        background: primary ? "var(--ds-color-accent)" : "transparent",
                        color: primary ? "#fff" : "var(--ds-color-accent)",
                        border: primary ? "none" : "1px solid rgba(230,81,0,0.4)",
                      }}
                    >
                      {icon}
                      {label}
                    </a>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ── Avaliações ── */}
          <div style={{ height: 1, background: "rgba(230,81,0,0.12)", margin: "20px 0" }} />
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold" style={{ color: "var(--ds-color-text-primary)", fontFamily: "Montserrat, sans-serif" }}>
                Avaliações
              </h2>
              {place.rating && place.rating > 0 && (
                <div className="flex items-center gap-1">
                  <Star size={14} fill="var(--ds-color-accent)" color="var(--ds-color-accent)" />
                  <span className="text-sm font-semibold" style={{ color: "var(--ds-color-accent)" }}>{place.rating.toFixed(1)}</span>
                  {place.reviewCount && (
                    <span className="text-xs" style={{ color: "var(--ds-color-text-secondary)" }}>
                      ({place.reviewCount.toLocaleString("pt-BR")})
                    </span>
                  )}
                </div>
              )}
            </div>

            <ReviewForm
              onSubmit={handleReviewSubmit}
              isAuthenticated={!!user}
              onLoginClick={() => window.open(getLoginUrl(), "_blank")}
            />

            {placeReviews && placeReviews.length > 0 ? (
              <div>
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
                className="p-4 text-center rounded-2xl"
                style={{ background: "rgba(230,81,0,0.06)", border: "1px solid rgba(230,81,0,0.12)" }}
              >
                <p className="text-sm font-medium mb-1" style={{ color: "var(--ds-color-text-primary)" }}>
                  Nenhuma avaliação ainda
                </p>
                <p className="text-xs" style={{ color: "var(--ds-color-text-secondary)" }}>
                  Seja o primeiro a avaliar este lugar.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ height: 100 }} />
      <TabBar />
    </div>
  );
}
