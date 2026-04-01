interface OranjeLogoProps {
  size?: number;
  showText?: boolean;
  className?: string;
  color?: string;
}

export function OranjeLogoSVG({ size = 40, showText = true, className = "", color = "#D88A3D" }: OranjeLogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Tulip SVG icon — matches the brand logomarca */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer ring */}
        <circle cx="50" cy="50" r="46" stroke={color} strokeWidth="3" fill="none" />
        {/* Inner ring */}
        <circle cx="50" cy="50" r="38" stroke={color} strokeWidth="2" fill="none" />

        {/* Tulip stem */}
        <line x1="50" y1="72" x2="50" y2="85" stroke={color} strokeWidth="2.5" strokeLinecap="round" />

        {/* Left leaf */}
        <path d="M50 78 Q38 74 36 64 Q44 68 50 78Z" fill={color} opacity="0.85" />
        {/* Right leaf */}
        <path d="M50 78 Q62 74 64 64 Q56 68 50 78Z" fill={color} opacity="0.85" />

        {/* Ground arc */}
        <path d="M34 72 Q50 66 66 72" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" />

        {/* Tulip body left petal */}
        <path d="M50 55 Q38 52 36 40 Q44 44 50 55Z" fill={color} opacity="0.9" />
        {/* Tulip body right petal */}
        <path d="M50 55 Q62 52 64 40 Q56 44 50 55Z" fill={color} opacity="0.9" />
        {/* Tulip center petal */}
        <path d="M50 55 Q43 46 44 33 Q50 38 56 33 Q57 46 50 55Z" fill={color} />

        {/* Diamond gem at top */}
        <path d="M50 28 L54 33 L50 38 L46 33 Z" fill={color} />
      </svg>

      {showText && (
        <span
          style={{
            fontFamily: "'Inter', system-ui, sans-serif",
            fontWeight: 600,
            letterSpacing: "0.2em",
            fontSize: size * 0.45,
            color: "#E8E6E3",
            textTransform: "uppercase" as const,
          }}
        >
          ORANJE
        </span>
      )}
    </div>
  );
}

export function OranjeLogoImg({ size = 40, showText = true, className = "" }: OranjeLogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <img
        src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663387178677/NVDcZljqXPmrhVlO.png"
        alt="ORANJE"
        width={size}
        height={size}
        style={{ objectFit: "contain" }}
      />
      {showText && (
        <span
          style={{
            fontFamily: "'Inter', system-ui, sans-serif",
            fontWeight: 600,
            letterSpacing: "0.2em",
            fontSize: size * 0.45,
            color: "#E8E6E3",
            textTransform: "uppercase" as const,
          }}
        >
          ORANJE
        </span>
      )}
    </div>
  );
}
