import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { OranjeHeader } from "@/components/OranjeHeader";
import { TabBar } from "@/components/TabBar";
import { usePlaceById, useFavorites, useReviewsByPlace, useMockMutation } from "@/hooks/useMockData";
import { MapPin, Phone, Globe, Instagram, AlertCircle, Heart, Share2, Star } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { ReviewCard } from "@/components/ReviewCard";
import { ReviewForm } from "@/components/ReviewForm";
import { DSButton, DSBadge } from "@/components/ds";

export default function PlaceDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const placeId = Number(id) || 0;

  const { data: placeData, isLoading } = usePlaceById(placeId);

  const { favoriteIds, addFavorite, removeFavorite } = useFavorites(!!user);

  const { data: placeReviews = [] } = useReviewsByPlace(placeId);

  const createReview = useMockMutation();
  const markHelpful = useMockMutation();

  const [, setReviewKey] = useState(0);

  const place = placeData as any;
  const isFavorite = favoriteIds.has(placeId);

  function handleToggleFavorite() {
    if (!user) { window.open(getLoginUrl(), '_blank'); return; }
    if (isFavorite) {
      removeFavorite(placeId);
    } else {
      addFavorite(placeId);
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

  function handleReviewSubmit(rating: number, comment: string) {
    if (!user) { window.open(getLoginUrl(), '_blank'); return; }
    createReview.mutate(
      { placeId, rating, comment },
      {
        onSuccess: () => {
          setReviewKey(k => k + 1);
        },
      }
    );
  }

  function handleMarkHelpful(_reviewId: number) {
    markHelpful.mutate(_reviewId, {});
  }

  if (isLoading) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--ds-color-bg-primary)" }}>
        <OranjeHeader showBack title="Carregando..." />
        <div style={{ paddingBottom: 80 }}>
          <div className="w-full animate-pulse" style={{ height: 280, background: "var(--ds-color-bg-secondary)" }} />
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

  const imageUrl = place.coverImage || "https://placehold.co/1200x600/e2e8f0/1e293b?text=Holambra";
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
        {/* Hero Image */}
        <div className="relative w-full" style={{ height: 280 }}>
          <img src={imageUrl} alt={place.name} className="w-full h-full object-cover" loading="lazy" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,37,26,0.7), transparent 60%)" }} />

          <div className="absolute top-4 left-4 flex flex-wrap gap-2">
            {place.isFeatured && <DSBadge variant="accent">Destaque</DSBadge>}
            {place.isRecommended && !place.isFeatured && <DSBadge variant="success">★ ORANJE</DSBadge>}
          </div>

          <div className="absolute top-4 right-4 flex gap-2">
            <button onClick={handleShare} className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "rgba(0,37,26,0.6)", backdropFilter: "blur(8px)" }}>
              <Share2 size={16} style={{ color: "var(--ds-color-text-primary)" }} />
            </button>
            <button onClick={handleToggleFavorite} className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: isFavorite ? "rgba(230,81,0,0.9)" : "rgba(0,37,26,0.6)", backdropFilter: "blur(8px)" }}>
              <Heart size={16} fill={isFavorite ? "#fff" : "none"} stroke={isFavorite ? "#fff" : "var(--ds-color-text-primary)"} />
            </button>
          </div>

          {place.rating && place.rating > 0 && (
            <div className="absolute bottom-4 right-4 px-3 py-2 rounded-xl flex items-center gap-1" style={{ background: "rgba(0,37,26,0.7)", backdropFilter: "blur(8px)" }}>
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
