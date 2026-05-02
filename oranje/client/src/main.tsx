import { trpc } from "@/lib/trpc";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { BrowserRouter } from "react-router-dom";
import { createRoot } from "react-dom/client";
import superjson from "superjson";
import App from "./App";
import "./index.css";


// Registrar Service Worker para PWA + auto-recovery de cache antigo.
// O SW v4 (cleanup) limpa caches legados (oranje-v1/v2/v3) que serviam HTML
// stale referenciando chunks JS antigos. Quando o SW envia SW_CLEANUP_RELOAD,
// recarregamos UMA vez para garantir bundle fresco.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });

  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data?.type === 'SW_CLEANUP_RELOAD') {
      const flag = 'oranje_sw_cleanup_done';
      try {
        if (!sessionStorage.getItem(flag)) {
          sessionStorage.setItem(flag, '1');
          window.location.reload();
        }
      } catch {
        window.location.reload();
      }
    }
  });
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      throwOnError: false,
    },
    mutations: {
      throwOnError: false,
    },
  },
});

// Log errors but don't redirect - let pages handle auth individually
queryClient.getQueryCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    console.error("[API Query Error]", event.query.state.error);
  }
});

queryClient.getMutationCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    console.error("[API Mutation Error]", event.mutation.state.error);
  }
});

// API base URL: use VITE_API_URL if set (for split frontend/backend deploys), otherwise relative
const API_BASE = import.meta.env.VITE_API_URL || "";

const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: `${API_BASE}/api/trpc`,
      transformer: superjson,
      headers() {
        try {
          const stored = localStorage.getItem("cms_token");
          if (stored) return { "x-cms-token": stored };
        } catch {}
        return {};
      },
      fetch(input, init) {
        return globalThis.fetch(input, {
          ...(init ?? {}),
          credentials: "include",
        }).catch((err) => {
          console.warn("[tRPC] Network request failed (backend unreachable):", err?.message || err);
          throw err;
        });
      },
    }),
  ],
});

createRoot(document.getElementById("root")!).render(
  <trpc.Provider client={trpcClient} queryClient={queryClient}>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </trpc.Provider>
);