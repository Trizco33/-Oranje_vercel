# Workspace

## Overview

Este workspace contém duas coisas:
1. **Template pnpm monorepo** (pasta raiz) — template de infra gerado pelo Replit, não usado pelo produto
2. **Projeto Oranje** (pasta `oranje/`) — o código real do produto, importado do GitHub `Trizco33/-Oranje_vercel`

## Projeto Oranje

O Oranje é um guia cultural e gastronômico de Holambra, SP, com site público, app/PWA, CMS/admin e blog.

### Stack do Oranje

- **Package manager**: npm (isolado do pnpm workspace)
- **Frontend**: React 19 + Vite 7 + Tailwind CSS 4 + Radix UI
- **Backend**: Express 4 + tRPC 11 + tsx (dev) / esbuild (prod)
- **Database**: MySQL via Drizzle ORM + mysql2
- **Auth**: JWT + Magic Link (via Resend)
- **Router**: React Router DOM 7

### Estrutura do Oranje

```text
oranje/
├── client/                  # Frontend React
│   └── src/
│       ├── App.tsx           # Router principal (/, /app, /admin, etc.)
│       ├── pages/            # Todas as páginas (SiteHome, Admin, CMSDashboard, etc.)
│       └── hooks/useMockData.ts  # ⚠️ Dados fictícios ainda em uso (a remover)
├── server/                  # Backend Express + tRPC
│   ├── _core/               # Entry, contexto tRPC, OAuth, Vite middleware
│   ├── routers.ts            # AppRouter principal (agrega todos os sub-routers)
│   ├── db.ts                 # Conexão MySQL com Drizzle
│   ├── content.router.ts     # Hero, header, footer, about, contact (CMS)
│   ├── cms.router.ts         # Páginas, SEO (CMS)
│   ├── places.router.ts      # Lugares/parceiros
│   ├── categories.router.ts  # Categorias
│   └── seed.ts               # Seed inicial do banco
├── drizzle/                  # Schema MySQL + migrations (0000 a 0013)
│   └── schema.ts             # Tabelas: places, categories, users, events, etc.
├── vite.config.ts            # Config Vite (root em client/)
├── drizzle.config.ts         # Config Drizzle Kit (MySQL)
├── .env                      # Variáveis de ambiente locais (DATABASE_URL vazio)
└── package.json              # Scripts: dev, build, start, db:push
```

### Scripts do Oranje

- `cd oranje && npm run dev` — inicia backend + Vite dev server na porta 3000
- `cd oranje && npm run build` — build frontend (vite) + bundle backend (esbuild)
- `cd oranje && npm run start` — inicia produção (requer build prévio)
- `cd oranje && npm run db:push` — gera e aplica migrations MySQL

### Variáveis de Ambiente do Oranje

| Variável | Status | Descrição |
|---|---|---|
| `DATABASE_URL` | ❌ BLOQUEADOR | MySQL URL (`mysql://user:pass@host:port/db`). Sem isso, todas as features de dados retornam vazio. Replit tem PostgreSQL (incompatível). |
| `OAUTH_SERVER_URL` | ❌ Bloqueador para auth | URL do servidor OAuth para login de usuários |
| `JWT_SECRET` | ⚠️ Placeholder | Segredo para assinar tokens JWT. Usar valor real em produção. |
| `VITE_APP_ID` | ✅ Configurado | `oranje-standalone` |
| `OWNER_OPEN_ID` | ✅ Configurado | `admin-owner` (padrão) |
| `ADMIN_KEY` | ⚠️ Placeholder | Chave para login no CMS admin |
| `RESEND_API_KEY` | Opcional | Para envio de magic links por email |

### Workflow Ativo

- **"Oranje Dev Server"** — roda em `localhost:3000`, serve frontend + API
  - Comando: `cd /home/runner/workspace/oranje && DATABASE_URL='' npm run dev`
  - DATABASE_URL é forçado vazio para evitar erro de conexão MySQL com a URL PostgreSQL do Replit

### Rotas Públicas

| Rota | Descrição |
|---|---|
| `/` | Site público (SiteHome) |
| `/app` | App/PWA (dashboard com dados) |
| `/app/explorar` | Explorar lugares por categoria |
| `/admin` | CMS/Admin (requer login) |
| `/api/trpc/*` | API tRPC |

### DB: Routes / Roteiros

- Tabela `routes` tem: id, userId, title, description, placeIds (json), **highlights** (json string[]), **placeNotes** (json Record<string,string>), duration, theme, isPublic, coverImage
- 8 roteiros curados seeded (ids 1–8), todos com placeIds reais, highlights e placeNotes editoriais
- Script de seed: `oranje/scripts/seed-routes.ts` (rodar com `npx tsx scripts/seed-routes.ts`)
- tRPC: `routes.adminCreate`, `routes.adminUpdate`, `routes.adminDelete` aceitam todos os campos

### Receptivo Oranje (nova feature estratégica)

Feature de **passeios turísticos guiados** — independente dos roteiros existentes.

**Arquitetura:**
- Tabela `guided_tours` — passeio (slug, nome, tagline, descrição, tema, duração, capa, status)
- Tabela `guided_tour_stops` — parada (tourId, placeId, stopOrder, narrative, tip, bestMoment)
- tRPC: `receptivo.list` (passeios ativos) + `receptivo.bySlug` (passeio + paradas com dados do lugar)
- Rota: `/app/receptivo/:slug` → `ReceptivoDetail.tsx`

**Piloto: Holambra Romântica**
- Slug: `holambra-romantica` | Status: active | 5 paradas | 2–3 horas
- Paradas reais (com IDs do banco):
  1. Rua dos Guarda-Chuvas (id 4215)
  2. Deck do Amor (id 4213)
  3. Praça Vitória Régia (id 4214)
  4. Moinho Povos Unidos (id 2616)
  5. Zoet en Zout (id 4212)

**Seed:** `oranje/server/seed-receptivo.ts` — cria tabelas + popula piloto
**Discovery:** Banner na home do app (`Home.tsx`) → `/app/receptivo/holambra-romantica`
**Mapa:** Leaflet com marcadores numerados, polyline do percurso, parada ativa em laranja
**UX:** Cover → Mapa + painel da parada ativa → Navegação (próxima/anterior) → Encerramento elegante

### Base de Lugares (atualizada abr/2026)

**40 lugares públicos** (dataPending=false, status=active) em **9 categorias**:
- Restaurantes (1): 9 lugares + Casa da Esfiha
- Hotéis (15): 9 lugares
- Pontos Turísticos (4): 6 lugares
- Pizzarias (13): 3 + Fiore Forneria + Vecchio Onofre + Italia No Box Holambra
- Parques (16): 3 lugares
- Bares (14): 3 lugares
- **Hamburguerias (18): Don Hamburgo** ← nova categoria + 1 lugar
- Docerias (17): 1 lugar
- Cafés (2): 1 lugar

**Categorias OCULTAS** (0 lugares públicos — filtradas pelo getCategoriesPublic()):
- Bares & Drinks, Compras, Hospedagem

### Regras de Navegação (site e app)

**Menu hamburger site (SiteHeader.tsx DEFAULT_NAV_ITEMS):**
- Início → /
- Receptivo Oranje → /app/receptivo
- Explorar → /app/explorar
- O que fazer → /o-que-fazer-em-holambra
- Mapa → /mapa
- Blog → /blog
- Contato → /contato
(Removidos: "Roteiros", "Parceiros")

**Tab bar do app (TabBar.tsx):** Home / Explorar / Eventos / Favoritos / Passeios

### Problemas Conhecidos

1. **Hero do CMS** — validação muito rígida (`subtitle` obrigatório, `buttonUrl`/`imageUrl` exigem URL absoluta)
2. **Mock data** — algumas páginas ainda usam `useMockData.ts` para dados secundários
3. **Sem banco MySQL local** — DATABASE_URL precisa ser MySQL de produção (Railway)
4. **lat/lng dos novos lugares** — Don Hamburgo, Fiore Forneria, Vecchio Onofre, Casa da Esfiha, Italia No Box Holambra têm lat/lng=null (precisam de verificação no Maps)

---

## Template pnpm Monorepo (pasta raiz — não usar para Oranje)

O template original existe na raiz do workspace mas não é o produto Oranje. Possui:
- `artifacts/api-server` — Express com apenas `/api/healthz`
- `artifacts/mockup-sandbox` — sandbox de componentes UI
- `lib/` — libs geradas (OpenAPI, Zod, Drizzle schema vazio)

Não mexer nesta estrutura a menos que seja para fins de infra Replit.
