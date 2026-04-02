import { useState, useRef, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { OranjeHeader } from "@/components/OranjeHeader";
import { TabBar } from "@/components/TabBar";
import { trpc } from "@/lib/trpc";
import { MapPin, Phone, Globe, Instagram, AlertCircle, Heart, Share2, Star, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { ReviewCard } from "@/components/ReviewCard";
import { ReviewForm } from "@/components/ReviewForm";
import { DSButton, DSBadge } from "@/components/ds";
import { getAllPlaceImages, getPlaceImage } from "@/components/PlaceCard";
import { getCategoryFallbackImage } from "@/constants/placeImages";

/* ─── Image Gallery Component ───────────────────────────────── */
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
      if (child) {
        scrollRef.current.scrollTo({ left: child.offsetLeft, behavior: "smooth" });
      }
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

  function handleImageError(index: number) {
    setImgErrors(prev => new Set(prev).add(index));
  }

  return (
    <div className="relative w-full" style={{ height: 300 }}>
      {/* Scrollable image strip */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="gallery-scroll"
        style={{
          display: "flex",
          height: "100%",
        }}
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
              onError={() => handleImageError(i)}
            />
          </div>
        ))}
      </div>

      {/* Gradient overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "linear-gradient(to top, rgba(0,37,26,0.7), transparent 60%)" }}
      />

      {/* Navigation arrows (desktop) */}
      {showNavigation && (
        <>
          <button
            onClick={() => goTo(Math.max(0, currentIndex - 1))}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center"
            style={{
              background: "rgba(0,37,26,0.6)",
              backdropFilter: "blur(4px)",
              opacity: currentIndex === 0 ? 0.3 : 0.9,
              display: currentIndex === 0 ? "none" : "flex",
            }}
          >
            <ChevronLeft size={16} color="#fff" />
          </button>
          <button
            onClick={() => goTo(Math.min(validImages.length - 1, currentIndex + 1))}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center"
            style={{
              background: "rgba(0,37,26,0.6)",
              backdropFilter: "blur(4px)",
              opacity: currentIndex >= validImages.length - 1 ? 0.3 : 0.9,
              display: currentIndex >= validImages.length - 1 ? "none" : "flex",
            }}
          >
            <ChevronRight size={16} color="#fff" />
          </button>
        </>
      )}

      {/* Dot indicators */}
      {showNavigation && (
        <div
          className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5"
          style={{ zIndex: 2 }}
        >
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

      {/* Image counter */}
      {showNavigation && (
        <div
          className="absolute bottom-3 right-3 px-2 py-1 rounded-full text-xs font-medium"
          style={{
            background: "rgba(0,37,26,0.6)",
            color: "#fff",
            backdropFilter: "blur(4px)",
            zIndex: 2,
          }}
        >
          {currentIndex + 1}/{validImages.length}
        </div>
      )}
    </div>
  );
}

/* ─── Place Detail Page ─────────────────────────────────────── */
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
    if (!user) { window.open(getLoginUrl(), '_blank'); return; }
    if (isFavorite) {
      removeFavoriteMutation.mutate({ placeId });
    } else {
      addFavoriteMutation.mutate({ placeId });
    }
  }

  function handleShare() {
    const shareUrl = `${window.location.origin}${window.location.pathname}${window.location.hash}`;
    if (navigator.share) {
      navigator.share({ title: place?.name, url: shareUrl });
    } else {
      navigator.clipboard.writeText(shareUrl);
    }
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
      1: "Restaurant",
      2: "CafeOrCoffeeShop",
      3: "BarOrPub",
      4: "TouristAttraction",
      5: "LodgingBusiness",
      6: "Store",
      13: "Restaurant",
      14: "BarOrPub",
      15: "Hotel",
      16: "Park",
      17: "Bakery",
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
    if (place.lat && place.lng) {
      schema.geo = { "@type": "GeoCoordinates", latitude: place.lat, longitude: place.lng };
    }
    if (place.phone || place.whatsapp) {
      schema.telephone = place.phone || place.whatsapp;
    }
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

    return () => {
      document.title = siteName;
    };
  }, [place]);

  function handleReviewSubmit(rating: number, comment: string) {
    if (!user) { window.open(getLoginUrl(), '_blank'); return; }
    createReviewMutation.mutate(
      { placeId, rating, comment },
      {
        onSuccess: () => {
          setReviewKey(k => k + 1);
          refetchReviews();
        },
      }
    );
  }

  function handleMarkHelpful(reviewId: number) {
    markHelpfulMutation.mutate(reviewId, {
      onSuccess: () => {
        refetchReviews();
      },
    });
  }

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

  // Network/API error
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
            Não foi possível carregar este lugar. Verifique sua conexão e tente novamente.
          </p>
          <div className="flex gap-3">
            <DSButton variant="primary" onClick={() => refetch()}>Tentar novamente</DSButton>
            <Link to="/app">
              <DSButton variant="secondary">Voltar à Home</DSButton>
            </Link>
          </div>
        </div>
        <div style={{ height: 100 }} />
        <TabBar />
      </div>
    );
  }

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
            Desculpe, não conseguimos encontrar este lugar.
          </p>
          <Link to="/app">
            <DSButton variant="primary">Voltar à Home</DSButton>
          </Link>
        </div>
        <div style={{ height: 100 }} />
        <TabBar />
      </div>
    );
  }

  // Collect all images: DB photos + place_images constant
  const allImages = getAllPlaceImages({
    name: place.name,
    coverImage: place.coverImage,
    images: place.images,
    categoryName: place.categoryName,
  });

  // Also add photos from the placePhotos relation if present
  if (place.photos && Array.isArray(place.photos)) {
    for (const photo of place.photos) {
      if (photo.url && !allImages.includes(photo.url)) {
        allImages.push(photo.url);
      }
    }
  }

  const mapsUrl = place.lat && place.lng ? `https://www.google.com/maps/search/${place.lat},${place.lng}` : null;
  const whatsappUrl = place.whatsapp
    ? `https://wa.me/${place.whatsapp.replace(/\D/g, '')}?text=Olá%20${encodeURIComponent(place.name)}%2C%20gostaria%20de%20informações`
    : null;
  const instagramUrl = place.instagram
    ? `https://instagram.com/${place.instagram.replace('@', '')}`
    : null;
  const tags = Array.isArray(place.tags) ? place.tags : [];

  return (
    <div style={{ minHeight: "100vh", background: "var(--ds-color-bg-primary)" }}>
      <OranjeHeader showBack title={place.name} />

      <div style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
        {/* Hero Image Gallery */}
        <div className="relative">
          <ImageGallery images={allImages} placeName={place.name} />

          <div className="absolute top-4 left-4 flex flex-wrap gap-2" style={{ zIndex: 3 }}>
            {place.isFeatured && <DSBadge variant="accent">Destaque</DSBadge>}
            {place.isRecommended && !place.isFeatured && <DSBadge variant="success">★ ORANJE</DSBadge>}
          </div>

          <div className="absolute top-4 right-4 flex gap-2" style={{ zIndex: 3 }}>
            <button onClick={handleShare} className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "rgba(0,37,26,0.6)", backdropFilter: "blur(8px)" }}>
              <Share2 size={16} style={{ color: "var(--ds-color-text-primary)" }} />
            </button>
            <button onClick={handleToggleFavorite} className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: isFavorite ? "rgba(230,81,0,0.9)" : "rgba(0,37,26,0.6)", backdropFilter: "blur(8px)" }}>
              <Heart size={16} fill={isFavorite ? "#fff" : "none"} stroke={isFavorite ? "#fff" : "var(--ds-color-text-primary)"} />
            </button>
          </div>

          {place.rating && place.rating > 0 && (
            <div className="absolute bottom-10 right-4 px-3 py-2 rounded-xl flex items-center gap-1" style={{ background: "rgba(0,37,26,0.7)", backdropFilter: "blur(8px)", zIndex: 3 }}>
              <span className="text-lg font-bold" style={{ color: "var(--ds-color-accent)" }}>★</span>
              <span className="text-sm font-semibold" style={{ color: "var(--ds-color-text-primary)" }}>{place.rating.toFixed(1)}</span>
              {place.reviewCount && <span className="text-xs" style={{ color: "var(--ds-color-text-secondary)" }}>({place.reviewCount})</span>}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="px-4 py-6">
          <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--ds-color-text-primary)" }}>
            {place.name}
          </h1>

          {place.shortDesc && (
            <p className="text-sm mb-4" style={{ color: "var(--ds-color-accent)" }}>{place.shortDesc}</p>
          )}

          {place.address && (
            <div className="flex items-start gap-2 mb-4">
              <MapPin size={16} style={{ color: "var(--ds-color-accent)", flexShrink: 0, marginTop: 2 }} />
              <p className="text-sm" style={{ color: "var(--ds-color-text-secondary)" }}>{place.address}</p>
            </div>
          )}

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {tags.map((tag: string, idx: number) => (
                <DSBadge key={idx} variant="outline">{tag}</DSBadge>
              ))}
            </div>
          )}

          <div style={{ height: 1, background: "rgba(230,81,0,0.15)", margin: "24px 0" }} />

          {place.longDesc && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2" style={{ color: "var(--ds-color-text-primary)" }}>Sobre</h2>
              <p className="text-sm leading-relaxed" style={{ color: "var(--ds-color-text-secondary)" }}>{place.longDesc}</p>
            </div>
          )}

          {place.hours && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2" style={{ color: "var(--ds-color-text-primary)" }}>Horário de Funcionamento</h2>
              <p className="text-sm whitespace-pre-line" style={{ color: "var(--ds-color-text-secondary)" }}>{place.hours}</p>
            </div>
          )}

          <div style={{ height: 1, background: "rgba(230,81,0,0.15)", margin: "24px 0" }} />

          {/* Contact Buttons */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3" style={{ color: "var(--ds-color-text-primary)" }}>Contato</h2>
            <div className="grid grid-cols-2 gap-3">
              {whatsappUrl && (
                <button onClick={() => window.open(whatsappUrl, "_blank")} className="w-full px-3 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2" style={{ background: "var(--ds-color-accent)", color: "#fff" }}>
                  <Phone size={16} /> WhatsApp
                </button>
              )}
              {instagramUrl && (
                <button onClick={() => window.open(instagramUrl, "_blank")} className="w-full px-3 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2" style={{ background: "transparent", border: "1px solid var(--ds-color-accent)", color: "var(--ds-color-accent)" }}>
                  <Instagram size={16} /> Instagram
                </button>
              )}
              {place.website && (
                <button onClick={() => window.open(place.website, "_blank")} className="w-full px-3 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2" style={{ background: "transparent", border: "1px solid var(--ds-color-accent)", color: "var(--ds-color-accent)" }}>
                  <Globe size={16} /> Website
                </button>
              )}
              {mapsUrl && (
                <button onClick={() => window.open(mapsUrl, "_blank")} className="w-full px-3 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2" style={{ background: "var(--ds-color-accent)", color: "#fff" }}>
                  <MapPin size={16} /> Como chegar
                </button>
              )}
            </div>
          </div>

          <div style={{ height: 1, background: "rgba(230,81,0,0.15)", margin: "24px 0" }} />

          {/* Reviews Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold" style={{ color: "var(--ds-color-text-primary)" }}>Avaliações</h2>
              {place.rating && place.rating > 0 && (
                <div className="flex items-center gap-1">
                  <Star size={16} fill="var(--ds-color-accent)" color="var(--ds-color-accent)" />
                  <span className="text-sm font-semibold" style={{ color: "var(--ds-color-accent)" }}>{place.rating.toFixed(1)}</span>
                  {place.reviewCount && <span className="text-xs" style={{ color: "var(--ds-color-text-secondary)" }}>({place.reviewCount})</span>}
                </div>
              )}
            </div>

            <ReviewForm
              onSubmit={handleReviewSubmit}
              isAuthenticated={!!user}
              onLoginClick={() => window.open(getLoginUrl(), '_blank')}
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
              <div className="p-4 text-center rounded-2xl" style={{ background: "rgba(230,81,0,0.06)", border: "1px solid rgba(230,81,0,0.12)" }}>
                <p className="text-sm" style={{ color: "var(--ds-color-text-secondary)" }}>Nenhuma avaliação ainda. Seja o primeiro a avaliar!</p>
              </div>
            )}
          </div>

          <div style={{ height: 1, background: "rgba(230,81,0,0.15)", margin: "24px 0" }} />

          <Link to="/app" className="block">
            <div className="p-4 text-center rounded-2xl" style={{ background: "rgba(230,81,0,0.06)", border: "1px solid rgba(230,81,0,0.12)" }}>
              <p className="text-sm font-medium" style={{ color: "var(--ds-color-text-primary)" }}>Explorar mais lugares</p>
              <p className="text-xs mt-1" style={{ color: "var(--ds-color-text-secondary)" }}>Volte à Home para descobrir outras atrações</p>
            </div>
          </Link>
        </div>
      </div>

      <div style={{ height: 100 }} />
      <TabBar />
    </div>
  );
}
