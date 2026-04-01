import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

export function ThemeToggle() {
  const { theme, toggleTheme, switchable } = useTheme();

  if (!switchable || !toggleTheme) {
    return null;
  }

  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center justify-center transition-all duration-200"
      style={{
        width: "40px",
        height: "40px",
        borderRadius: "var(--ds-radius-lg)",
        background: isDark ? "rgba(230, 81, 0, 0.12)" : "rgba(13, 74, 64, 0.08)",
        border: "1px solid " + (isDark ? "rgba(230, 81, 0, 0.15)" : "rgba(13, 74, 64, 0.12)"),
        cursor: "pointer",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = isDark ? "rgba(230, 81, 0, 0.2)" : "rgba(13, 74, 64, 0.15)";
        e.currentTarget.style.transform = "scale(1.05)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = isDark ? "rgba(230, 81, 0, 0.12)" : "rgba(13, 74, 64, 0.08)";
        e.currentTarget.style.transform = "scale(1)";
      }}
      title={`Mudar para modo ${isDark ? "claro" : "escuro"}`}
      aria-label={`Mudar para modo ${isDark ? "claro" : "escuro"}`}
    >
      {isDark ? (
        <Sun width={18} height={18} style={{ color: "var(--ds-color-accent)" }} />
      ) : (
        <Moon width={18} height={18} style={{ color: "var(--oranje-green-deep)" }} />
      )}
    </button>
  );
}
