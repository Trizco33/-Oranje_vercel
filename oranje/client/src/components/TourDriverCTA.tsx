import { useState } from "react";
import { Car, ChevronRight } from "lucide-react";
import { TourRequestSheet } from "./TourRequestSheet";

interface TourDriverCTAProps {
  tourId: number;
  tourName: string;
  requiresTransport?: boolean;
  walkOnly?: boolean;
  recommendedWithDriver?: boolean;
  clientPrice?: number | null;
  driverPayout?: number | null;
  partnerFee?: number | null;
}

export function TourDriverCTA({
  tourId,
  tourName,
  requiresTransport,
  walkOnly,
  recommendedWithDriver,
  clientPrice,
}: TourDriverCTAProps) {
  const [sheetOpen, setSheetOpen] = useState(false);

  const isEligible = !walkOnly && (requiresTransport || recommendedWithDriver);
  if (!isEligible) return null;

  const hasPrice = clientPrice != null && clientPrice > 0;

  return (
    <>
      <div
        style={{
          margin: "0 16px 16px",
          borderRadius: 16,
          background: "linear-gradient(160deg, #001A12 0%, #00251A 60%, #002E1F 100%)",
          border: "1px solid rgba(230,81,0,0.18)",
          padding: "18px 16px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.18)",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: "rgba(230,81,0,0.15)",
              border: "1px solid rgba(230,81,0,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Car size={20} color="#E65100" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p
              style={{
                color: "rgba(255,255,255,0.45)",
                fontSize: 9,
                fontWeight: 700,
                fontFamily: "Montserrat, sans-serif",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                margin: "0 0 3px",
              }}
            >
              {requiresTransport ? "Requer transporte" : "Recomendado com motorista"}
            </p>
            <p
              style={{
                color: "#fff",
                fontSize: 15,
                fontWeight: 700,
                fontFamily: "Montserrat, sans-serif",
                margin: "0 0 4px",
                lineHeight: 1.3,
              }}
            >
              Fazer com Motorista Oranje
            </p>
            <p
              style={{
                color: "rgba(255,255,255,0.55)",
                fontSize: 12,
                fontFamily: "Montserrat, sans-serif",
                margin: "0 0 14px",
                lineHeight: 1.5,
              }}
            >
              Passeio curado com motorista parceiro — conforto, pontualidade e experiência premium.
            </p>
            {hasPrice && (
              <p
                style={{
                  color: "#E65100",
                  fontSize: 13,
                  fontWeight: 700,
                  fontFamily: "Montserrat, sans-serif",
                  margin: "0 0 14px",
                }}
              >
                R$ {clientPrice!.toFixed(2).replace(".", ",")} por passeio
              </p>
            )}
            <button
              onClick={() => setSheetOpen(true)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: "#E65100",
                border: "none",
                borderRadius: 10,
                padding: "11px 18px",
                cursor: "pointer",
                width: "100%",
                justifyContent: "center",
              }}
            >
              <span
                style={{
                  color: "#fff",
                  fontSize: 13,
                  fontWeight: 700,
                  fontFamily: "Montserrat, sans-serif",
                }}
              >
                Solicitar este passeio
              </span>
              <ChevronRight size={16} color="#fff" />
            </button>
          </div>
        </div>
      </div>

      <TourRequestSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        tourId={tourId}
        tourName={tourName}
        clientPrice={clientPrice}
      />
    </>
  );
}
