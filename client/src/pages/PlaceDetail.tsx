import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { OranjeHeader } from "@/components/OranjeHeader";
import { TabBar } from "@/components/TabBar";
import { trpc } from "@/lib/trpc";
import { MapPin, Phone, Globe, Instagram, AlertCircle, Heart, Share2, Star } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { ReviewCard } from "@/components/ReviewCard";
import { ReviewForm } from "@/components/ReviewForm";

export default function PlaceDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const placeId = Number(id) || 0;

  // ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL RETURNS
  const { data: placeData, isLoading, error: queryError } = trpc.places.byId.useQuery(
    { id: placeId },
    { enabled: placeId > 0 }
  );

  const { data: userFavs } = trpc.favorites.list.useQuery(undefined, { enabled: !!user });
  const addFav = trpc.favorites.add.useMutation();
  const removeFav = trpc.favorites.remove.useMutation();
  const utils = trpc.useUtils();

  const { data: placeReviews = [] } = trpc.reviews.listByPlace.useQuery(
    { placeId },
    { enabled: placeId > 0 }
  );

  const createReview = trpc.reviews.create.useMutation();
  const markHelpful = trpc.reviews.markHelpful.useMutation();

  const [, setReviewKey] = useState(0);

  // Derived state
  const place = placeData as any;
  const isFavorite = userFavs?.some((f: any) => f.placeId === placeId) ?? false;

  function handleToggleFavorite() {
    if (!user) { window.open(getLoginUrl(), '_blank'); return; }
    if (isFavorite) {
      removeFav.mutate({ placeId }, { onSuccess: () => utils.favorites.list.invalidate() });
    } else {
      addFav.mutate({ placeId }, { onSuccess: () => utils.favorites.list.invalidate() });
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
          utils.reviews.listByPlace.invalidate({ placeId });
          setReviewKey(k => k + 1);
        },
      }
    );
  }

  function handleMarkHelpful(reviewId: number) {
    markHelpful.mutate(reviewId, {
      onSuccess: () => utils.reviews.listByPlace.invalidate({ placeId }),
    });
  }

  // CONDITIONAL RETURNS (after all hooks)
  if (isLoading) {
    return (
      <div className="oranje-app min-h-screen flex flex-col">
        <OranjeHeader showBack title="Carregando..." />
        <div className="flex-1 overflow-y-auto pb-20">
          <div className="w-full h-64 bg-muted animate-pulse" />
          <div className="px-4 py-6 space-y-4">
            <div className="h-8 bg-muted rounded animate-pulse w-3/4" />
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded animate-pulse" />
              <div className="h-4 bg-muted rounded animate-pulse w-5/6" />
            </div>
            <div className="space-y-3 pt-4">
              <div className="h-12 bg-muted rounded animate-pulse" />
              <div className="h-12 bg-muted rounded animate-pulse" />
              <div className="h-12 bg-muted rounded animate-pulse" />
            </div>
          </div>
        </div>
        <div className="mb-tab" />
        <TabBar />
      </div>
    );
  }

  if (!place && !queryError) {
    return (
      <div className="oranje-app min-h-screen flex flex-col">
        <OranjeHeader showBack title="Lugar não encontrado" />
        <div className="flex-1 px-4 flex flex-col items-center justify-center">
          <AlertCircle size={48} style={{ color: "#D88A3D" }} className="mb-4" />
          <h2 className="text-xl font-bold text-center mb-2" style={{ color: "#E8E6E3", fontFamily: "'Playfair Display', serif" }}>
            Lugar não encontrado
          </h2>
          <p className="text-sm text-center mb-6" style={{ color: "#C8C5C0" }}>
            Desculpe, não conseguimos encontrar este lugar.
          </p>
          <Link to="/app" className="btn-gold px-6 py-2.5 rounded-xl text-sm font-semibold">
            Voltar à Home
          </Link>
        </div>
        <div className="mb-tab" />
        <TabBar />
      </div>
    );
  }

  if (!place) return null;

  const imageUrl = place.coverImage || "https://images.unsplash.com/photo-1490750967868-88df5691cc4c?w=800&h=500&fit=crop";
  const mapsUrl = place.mapsUrl || (place.lat && place.lng ? `https://www.google.com/maps/search/${place.lat},${place.lng}` : null);
  const whatsappUrl = place.whatsapp
    ? `https://wa.me/${place.whatsapp.replace(/\D/g, '')}?text=Olá%20${encodeURIComponent(place.name)}%2C%20gostaria%20de%20informações`
    : null;
  const instagramUrl = place.instagram
    ? `https://instagram.com/${place.instagram.replace('@', '')}`
    : null;
  const tags = Array.isArray(place.tags) ? place.tags : [];

  return (
    <div className="oranje-app min-h-screen">
      <OranjeHeader showBack title={place.name} />

      <div className="pb-safe">
        {/* Hero Image */}
        <div className="relative w-full" style={{ height: 280 }}>
          <img src={imageUrl} alt={place.name} className="w-full h-full object-cover" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          <div className="absolute top-4 left-4 flex flex-wrap gap-2">
            {place.isFeatured && <span className="badge-featured">Destaque</span>}
            {place.isRecommended && !place.isFeatured && <span className="badge-recommended">★ ORANJE</span>}
          </div>

          <div className="absolute top-4 right-4 flex gap-2">
            <button onClick={handleShare} className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)" }}>
              <Share2 size={16} style={{ color: "#E8E6E3" }} />
            </button>
            <button onClick={handleToggleFavorite} className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: isFavorite ? "rgba(216,138,61,0.9)" : "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)" }}>
              <Heart size={16} fill={isFavorite ? "#0E1A26" : "none"} stroke={isFavorite ? "#0E1A26" : "#E8E6E3"} />
            </button>
          </div>

          {place.rating && place.rating > 0 && (
            <div className="absolute bottom-4 right-4 px-3 py-2 rounded-xl flex items-center gap-1" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }}>
              <span className="text-lg font-bold" style={{ color: "#D88A3D" }}>★</span>
              <span className="text-sm font-semibold" style={{ color: "#E8E6E3" }}>{place.rating.toFixed(1)}</span>
              {place.reviewCount && <span className="text-xs" style={{ color: "#C8C5C0" }}>({place.reviewCount})</span>}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="px-4 py-6">
          <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: "'Playfair Display', serif", color: "#E8E6E3" }}>
            {place.name}
          </h1>

          {place.shortDesc && (
            <p className="text-sm mb-4" style={{ color: "#D88A3D" }}>{place.shortDesc}</p>
          )}

          {place.address && (
            <div className="flex items-start gap-2 mb-4">
              <MapPin size={16} style={{ color: "#D88A3D", flexShrink: 0, marginTop: 2 }} />
              <p className="text-sm" style={{ color: "#C8C5C0" }}>{place.address}</p>
            </div>
          )}

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {tags.map((tag: string, idx: number) => (
                <span key={idx} className="tag-chip text-xs">{tag}</span>
              ))}
            </div>
          )}

          <div className="oranje-divider my-6" />

          {place.longDesc && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2" style={{ color: "#E8E6E3", fontFamily: "'Playfair Display', serif" }}>Sobre</h2>
              <p className="text-sm leading-relaxed" style={{ color: "#C8C5C0" }}>{place.longDesc}</p>
            </div>
          )}

          {place.openingHours && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2" style={{ color: "#E8E6E3", fontFamily: "'Playfair Display', serif" }}>Horário de Funcionamento</h2>
              <p className="text-sm whitespace-pre-line" style={{ color: "#C8C5C0" }}>{place.openingHours}</p>
            </div>
          )}

          <div className="oranje-divider my-6" />

          {/* Contact Buttons */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3" style={{ color: "#E8E6E3", fontFamily: "'Playfair Display', serif" }}>Contato</h2>
            <div className="grid grid-cols-2 gap-3">
              {whatsappUrl && (
                <button onClick={() => window.open(whatsappUrl, "_blank")} className="btn-gold w-full px-3 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2">
                  <Phone size={16} /> WhatsApp
                </button>
              )}
              {instagramUrl && (
                <button onClick={() => window.open(instagramUrl, "_blank")} className="btn-ghost-gold w-full px-3 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2">
                  <Instagram size={16} /> Instagram
                </button>
              )}
              {place.website && (
                <button onClick={() => window.open(place.website, "_blank")} className="btn-ghost-gold w-full px-3 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2">
                  <Globe size={16} /> Website
                </button>
              )}
              {mapsUrl && (
                <button onClick={() => window.open(mapsUrl, "_blank")} className="btn-gold w-full px-3 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2">
                  <MapPin size={16} /> Como chegar
                </button>
              )}
            </div>
          </div>

          <div className="oranje-divider my-6" />

          {/* Reviews Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold" style={{ color: "#E8E6E3", fontFamily: "'Playfair Display', serif" }}>Avaliações</h2>
              {place.rating && place.rating > 0 && (
                <div className="flex items-center gap-1">
                  <Star size={16} fill="#D88A3D" color="#D88A3D" />
                  <span className="text-sm font-semibold" style={{ color: "#D88A3D" }}>{place.rating.toFixed(1)}</span>
                  {place.reviewCount && <span className="text-xs" style={{ color: "#C8C5C0" }}>({place.reviewCount})</span>}
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
              <div className="glass-card p-4 text-center">
                <p className="text-sm" style={{ color: "#C8C5C0" }}>Nenhuma avaliação ainda. Seja o primeiro a avaliar!</p>
              </div>
            )}
          </div>

          <div className="oranje-divider my-6" />

          <Link to="/app" className="block">
            <div className="glass-card p-4 text-center">
              <p className="text-sm font-medium" style={{ color: "#E8E6E3" }}>Explorar mais lugares</p>
              <p className="text-xs mt-1" style={{ color: "#C8C5C0" }}>Volte à Home para descobrir outras atrações</p>
            </div>
          </Link>
        </div>
      </div>

      <TabBar />
    </div>
  );
}
