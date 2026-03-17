import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

export function ThemeToggle() {
  const { theme, toggleTheme, switchable } = useTheme();

  if (!switchable || !toggleTheme) {
    return null;
  }

  return (
    <button
      onClick={toggleTheme}
      className="w-10 h-10 rounded-full flex items-center justify-center transition-all"
      style={{
        background: theme === "dark" ? "rgba(242,140,40,0.15)" : "rgba(242,140,40,0.08)",
        cursor: "pointer",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = theme === "dark" ? "rgba(242,140,40,0.25)" : "rgba(242,140,40,0.15)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = theme === "dark" ? "rgba(242,140,40,0.15)" : "rgba(242,140,40,0.08)";
      }}
      title={`Mudar para modo ${theme === "dark" ? "claro" : "escuro"}`}
    >
      {theme === "dark" ? (
        <Sun width={18} height={18} color="#F28C28" />
      ) : (
        <Moon width={18} height={18} color="#F28C28" />
      )}
    </button>
  );
}
