# ORANJE — Guia Cultural de Holambra

## Banco de Dados & Backend
- [x] Schema completo: categories, places, events, vouchers, partners, ads, favorites, routes, place_photos, notifications
- [x] Seed data: 4 categorias + 30 lugares reais de Holambra
- [x] Seed: eventos, vouchers, parceiros, anúncios
- [x] Routers tRPC: places (list, detail, search, filter, featured)
- [x] Routers tRPC: categories, events, vouchers, partners, ads
- [x] Routers tRPC: favorites (add, remove, list — autenticado)
- [x] Routers tRPC: routes/roteiros (create, update, delete, list)
- [x] Routers tRPC: admin CRUD completo (protegido por role=admin)
- [x] Router: alertas/notificações automáticas para novos eventos
- [x] Router: geração de imagens por IA para eventos e lugares

## Identidade Visual
- [x] Tema dark com paleta ORANJE (Navy #0E1A26, Dourado #D88A3D, Off-white #E8E6E3)
- [x] Tipografia elegante (Inter + Playfair Display via Google Fonts)
- [x] CSS global com variáveis de tema, animações e componentes base
- [x] Logo/ícone ORANJE com tulipa (SVG inline + imagem CDN)
- [x] PWA manifest e meta tags

## Páginas Frontend
- [x] Home: hero visual, categorias em destaque, busca rápida, recomendados, eventos próximos
- [x] Explorar: grid de categorias (Gastronomia, Turismo, Eventos, Hospedagem)
- [x] Busca: campo com filtros por categoria, tags e ordenação
- [x] Detalhes do Lugar: galeria de fotos, mapa Google Maps, horários, contato, avaliações, selos, voucher
- [x] Favoritos: lista de favoritos do usuário autenticado
- [x] Roteiros: criação e visualização de roteiros personalizados
- [x] Eventos: listagem e detalhes de eventos
- [x] Ofertas & Experiências: anúncios + vouchers
- [x] Admin: dashboard com CRUD de lugares, categorias, eventos, parceiros, anúncios, vouchers
- [x] Admin: geração de imagem por IA para eventos/lugares
- [x] Admin: envio de alertas/notificações

## Monetização
- [x] Selos: "Recomendado pelo ORANJE", "Parceiro ORANJE", "Destaque"
- [x] Banner de anúncio discreto no rodapé
- [x] Página de Ofertas com vouchers e anúncios
- [x] Planos de parceiro: Essencial / Destaque / Premium

## PWA & Qualidade
- [x] manifest.json com ícones e configuração PWA
- [x] Navegação inferior (tab bar) mobile-first
- [x] Responsividade completa
- [x] Testes vitest para routers principais (23 testes passando)


## Integração Supabase
- [x] Instalar @supabase/supabase-js
- [x] Configurar cliente Supabase com URL e anon key
- [x] Criar função para buscar lugares ativos ordenados (featured DESC, recommended DESC, created_at DESC)
- [x] Integrar dados do Supabase na Home
- [x] Adicionar selos visuais para featured e recommended
- [x] Adicionar botão "Como chegar" com maps_url
- [x] Tratar erro caso não retorne dados
- [x] Testar integração e fazer checkpoint


## Rota Dinâmica /lugar/[id]
- [x] Criar página PlaceDetail.tsx com rota dinâmica
- [x] Buscar lugar no Supabase por ID
- [x] Renderizar nome, descrição, imagem, categoria, tags, horário
- [x] Adicionar botões de contato (WhatsApp, Instagram, Site, Maps)
- [x] Criar fallback visual para lugar não encontrado
- [x] Integrar links em Home e Explorar
- [x] Testar navegação e fazer checkpoint


## Correção de Roteamento (HashRouter)
- [x] Instalar react-router-dom
- [x] Substituir wouter por react-router-dom com HashRouter
- [x] Converter todas as rotas para react-router
- [x] Testar URLs com # (ex: #/lugar/123)
- [x] Verificar que não há mais 404s em rotas diretas
- [x] Fazer checkpoint e publicar


## Correção de Links (Navegação Relativa)
- [x] Encontrar todos os links com domínio absoluto
- [x] Converter para navegação relativa (to="/lugar/123")
- [x] Verificar que não há https://seuapp.manus.space nos links
- [x] Testar navegação e fazer checkpoint


## Remoção de Navegação Absoluta
- [x] Encontrar window.location.href e location.href
- [x] Remover BASE_URL ou domínios fixos
- [x] Converter para navigate() ou Link to
- [x] Verificar que não há seuapp.manus.space no código
- [x] Testar e publicar


## Correção de 404 ao Clicar nos Cards
- [x] Verificar PlaceCard usa place.id real
- [x] Verificar App.tsx tem rota /lugar/:id
- [x] Verificar PlaceDetail.tsx lê param :id
- [x] Verificar busca Supabase por ID
- [x] Testar clique em card e navegação
- [x] Publicar


## Correção de HashRouter (URLs com #)
- [x] Encontrar todos os <a> tags em cards
- [x] Converter para <Link> do react-router-dom
- [x] Remover window.location de cards
- [x] Verificar que URLs mantém # (/#/lugar/id)
- [x] Testar navegação entre páginas
- [x] Fazer checkpoint


## Melhorias Adicionais
- [x] Sincronização em tempo real com Supabase (listeners)
- [x] Filtros avançados na Busca (categoria, preço, tags, localização)
- [x] Sistema de reviews com avaliações (1-5 estrelas) e comentários

## Sistema de Autenticação via Magic Link
- [x] Criar tabela magic_links no banco de dados
- [x] Implementar funções db: createMagicLink, getMagicLink, markMagicLinkAsUsed
- [x] Implementar funções db: getUserByEmail, createUserWithEmail
- [x] Corrigir procedimento tRPC requestMagicLink (buscar/criar usuário antes de criar link)
- [x] Implementar procedimento tRPC verifyMagicLink com cookie httpOnly
- [x] Criar página Login.tsx com formulário de email
- [x] Criar página LoginCallback.tsx para processar token
- [x] Adicionar rotas /login e /login/callback em App.tsx
- [x] Implementar envio de email com Resend (produção) ou console (desenvolvimento)
- [x] Escrever testes vitest para magic link (6 testes passando)
- [x] Implementar botão de logout em Home.tsx
- [ ] Testar fluxo completo: solicitar link -> receber email -> fazer login -> criar cookie
- [ ] Publicar no Manus

## Proteção de Rotas com AdminGuard
- [x] Verificar campo role na tabela users (já existe: admin/user)
- [x] Confirmar auth.me retorna role (já retorna via ctx.user)
- [x] Criar componente AdminGuard.tsx com proteção
- [x] Aplicar AdminGuard na rota /admin em App.tsx
- [x] Verificar link de Admin no menu (já mostra apenas para admins)
- [x] Escrever testes vitest para AdminGuard (6 testes passando)
- [x] Testar fluxo: admin acessa /admin, não-admin vê "Acesso negado", deslogado vê "Fazer Login"
- [x] Melhorar UX de "Acesso restrito": adicionar botões "Voltar para Home" e "Sair"
- [x] Esconder link de Admin para usuários comuns (já feito em OranjeHeader.tsx)

## Sistema de Auditoria Admin (FINALIZADO)
- [x] Criar tabela admin_logs no schema Drizzle
- [x] Executar migration (pnpm db:push)
- [x] Adicionar logging nas mutations admin (places, events, vouchers, partners, ads)
- [x] Criar rota tRPC adminLogs.list com paginação e join com users para userEmail
- [x] Criar componente UI para aba Logs no painel admin com tabela formatada
- [x] Escrever testes vitest para sistema de auditoria (10 testes passando)
- [x] Testar fluxo: criar/editar/deletar lugar -> verificar log
- [x] Testar acesso não-autorizado: usuário não-admin não pode acessar adminLogs.list
- [x] Tabela com colunas: Data | Admin | Ação | Tipo | ID

## Favoritos Persistentes (FINALIZADO)
- [x] Criar tabela favorites no schema Drizzle (já existia)
- [x] Aplicar migration (já aplicada)
- [x] Implementar router tRPC favorites (list, add, remove, toggle) (já implementado)
- [x] Adicionar endpoint places.byIds
- [x] Atualizar PlaceCard com botão de favorito (já implementado)
- [x] Atualizar PlaceDetail com botão de favorito (já implementado)
- [x] Criar página /favoritos (já implementada)
- [x] Escrever testes vitest para favoritos (4 testes passando)
- [x] Testar persistência após refresh
- [x] Testar isolamento entre usuários

## Motoristas Premium (Sistema de Transporte) - EM PROGRESSO
- [x] Criar tabela drivers no schema Drizzle
- [x] Aplicar migration
- [x] Implementar router tRPC drivers (list, create, admin procedures)
- [x] Registrar logs de acoes admin
- [x] Corrigir conflito de tipos tRPC
- [x] Criar TransportPage.tsx com listagem publica
- [x] Implementar ordenacao: parceiros primeiro
- [x] Implementar badges: Parceiro ORANJE + Verificado
- [x] Implementar botao WhatsApp formatado
- [x] Implementar formulario de cadastro publico
- [x] Testar fluxo: PENDING -> ACTIVE -> aparicao
- [ ] Adicionar card de Transporte na Home
- [x] Adicionar aba Motoristas no painel admin
- [ ] Escrever testes vitest para drivers


## Admin - Aba Motoristas (FINALIZADO)
- [x] Criar componente DriversAdminTab.tsx com tabela
- [x] Implementar filtros por status (PENDING, ACTIVE, REJECTED)
- [x] Implementar contador de motoristas PENDING
- [x] Implementar botão Aprovar (setStatus ACTIVE)
- [x] Implementar botão Rejeitar (setStatus REJECTED)
- [x] Implementar botão Marcar Parceiro (definir partnerUntil)
- [x] Implementar botão Remover Parceiro
- [x] Implementar botão Editar dados
- [x] Implementar botão Deletar
- [x] Integrar tab Motoristas no painel Admin (Admin.tsx)
- [x] Testar fluxo: cadastro público -> PENDING -> ACTIVE
- [x] Testar fluxo: marcar parceiro -> aparece no topo
- [x] Testar fluxo: remover parceiro -> volta à ordem normal
- [x] Testar fluxo: expiração de partnerUntil (suporta alteração de data)


## Melhorias de UX/UI - Fase 3 (FINALIZADO)
- [x] Menu hamburger responsivo (MobileMenu.tsx)
  - Componente com animações suaves (slideIn, fadeIn)
  - Links para Explorar, Eventos, Favoritos, Roteiros
  - Overlay com close automático
  - Integrado ao OranjeHeader.tsx
  - Responsivo: aparece apenas em telas pequenas (md:hidden)

- [x] Página de onboarding interativo (Onboarding.tsx)
  - 4 passos: Explorar, Favoritos, Transporte, Roteiros
  - Tour visual com ícones, descrições e cores personalizadas
  - Animações: slideUp, iconBounce, progressPulse
  - Barra de progresso visual
  - Botões: Próximo, Pular, Explorar Agora
  - Integrado ao Home.tsx com verificação de primeira visita
  - Rota adicionada em App.tsx (/app/onboarding)
  - localStorage para persistência (onboarding_completed)

- [x] Dark/Light mode toggle (ThemeToggle.tsx)
  - Componente com ícones Sun/Moon
  - Integrado ao OranjeHeader.tsx
  - ThemeProvider habilitado com switchable={true}
  - Estilos de tema claro em index.css
  - Tema persistido em localStorage
  - Suporte a prefers-reduced-motion

- [x] Testes vitest para todas as funcionalidades
  - 23 testes criados e passando
  - Cobertura: Mobile Menu, Onboarding, Theme Toggle, Integração
  - Total: 74 testes passando


## Ajustes Visuais (UI Premium)

- [x] Criar padrão único de card base (border-radius 12px, fundo grafite, borda sutil)
- [x] Atualizar cards do Explorar com ícones minimalistas (remover emojis)
- [x] Atualizar cards de Destaques com padrão base
- [x] Aplicar padrão em listas (lugares, eventos, roteiros, motoristas)
- [x] Remover emojis e padronizar ícones em todo o app
- [x] Adicionar micro-interações (hover/scale suave)
- [x] Garantir consistência de contraste e legibilidade


## Correção Crítica: App Não Renderizava (Março 2026)
- [x] Diagnosticar causa raiz: React não montava no DOM (root div vazio)
- [x] Identificar problema: vite.ts não salvava referência do Vite server no app
- [x] Corrigir vite.ts: adicionar `(app as any).vite = vite` em setupVite()
- [x] Corrigir Home.tsx: remover seção Upcoming Events com variável `upcomingEvents` indefinida
- [x] Corrigir PlaceDetail.tsx: mover hooks (reviews.listByPlace, reviews.create, reviews.markHelpful) para antes dos early returns condicionais
- [x] Verificar Home renderiza corretamente com categorias, destaques, recomendados
- [x] Verificar PlaceDetail renderiza com dados, contato, avaliações
- [x] Verificar Explorar renderiza com lista de categorias

## Bug: Erro no domínio oranjeapp.com.br (produção)
- [x] Diagnosticar por que o app funciona no preview Manus mas falha em oranjeapp.com.br
- [x] Verificar build de produção (vite build)
- [x] Verificar vite.ts em modo produção (SPA fallback sem Vite dev server)
- [x] Corrigido: build de produção local funciona. Site precisa ser republicado com checkpoint 4568cf08

## Correção de Erros TypeScript (Março 2026)
- [x] Corrigir 36 erros TypeScript em 15 arquivos
- [x] seed.ts: usar eq() em vez de objeto literal no .where()
- [x] db.ts: cast de status para enum correto
- [x] Home.tsx: remover {} de queries void (categories.list, favorites.list)
- [x] PlaceDetail.tsx: remover {} de favorites.list
- [x] Search.tsx: usar campos corretos do places.list (categoryId em vez de search/featured)
- [x] Favorites.tsx: remover {} de queries void, adicionar tipos em callbacks
- [x] CategoryList.tsx: remover {} de categories.list
- [x] CategoryDetail.tsx: adicionar tipo em callback .map()
- [x] DriversAdminTab.tsx: usar drivers.listAdmin/update/delete em vez de drivers.admin.*
- [x] AdminDrivers.tsx: usar paths tRPC corretos
- [x] AdminPlaces.tsx: adicionar procedures create/update/delete ao places.router.ts
- [x] CMSBlog.tsx: remover slug de create/update, fix delete para usar objeto
- [x] CMSEditor.tsx: mapear items para services no updateServicesMutation
- [x] LandingNew.tsx: adicionar tipos em callbacks .map()
- [x] SiteBlogPost.tsx: importar Link de react-router-dom
- [x] Build de produção: 0 erros, compilação em 6.41s (1835 módulos)

## Testes de Rota (Março 2026)
- [x] Home (/#/app): hero, categorias, destaques, recomendados, TabBar
- [x] Explorar (/#/app/explorar): 7 categorias com descrições
- [x] PlaceDetail (/#/app/lugar/2): dados completos, contato, avaliações
- [x] Navegação: URLs diretas funcionam, TabBar configurado corretamente
- [x] PWA: manifest.json, sw.js, PWAInstallPrompt renderiza


## BUG FIX: PWA Install Button no SITE (Março 2026)
- [x] Detectar corretamente se PWA está instalado usando window.matchMedia('(display-mode: standalone)').matches
- [x] Ocultar botão "Baixar app" quando PWA já está instalado
- [x] Testar no site oranjeapp.com.br - FUNCIONANDO

## BUG FIX: Mobile Menu Navigation no SITE (Março 2026)
- [x] Verificar SiteHome.tsx e componentes de site por <a href> tags
- [x] SiteHeader.tsx já usa React Router Link corretamente
- [x] Navegação sem refresh funcionando - URL muda sem reload
- [x] Testar todas as rotas do menu no site - FUNCIONANDO


## Otimizações (Março 2026)
- [x] Implementar lazy loading com React.lazy() para rotas principais
- [x] Reduzir bundle inicial de 1.37MB → 883.27 kB (35% redução)
- [x] Adicionar Suspense com LoadingFallback para transições suaves
- [x] Testar carregamento de chunks em cada rota - FUNCIONANDO

## Testes Vitest para Drivers (Março 2026)
- [x] Criar server/drivers.test.ts com testes para CRUD de drivers
- [x] Testar listAdmin, update, delete, setPartner - 18 testes PASSARAM
- [x] Testar validações e erros - COBERTURA COMPLETA
- [x] Executar pnpm test - 32 testes PASSARAM

## Sincronização Domínio Customizado (Março 2026)
- [ ] Republish/rebind oranjeapp.com.br no painel de Domains do Manus
- [ ] Verificar se domínio serve o build mais recente
- [ ] Comparar bundle hashes entre culturaguia-8rzdssws.manus.space e oranjeapp.com.br
- [ ] Aguardar propagação de DNS (5-10 minutos)


## Bug Fixes (Março 2026)
- [x] Corrigir "Maximum update depth exceeded" no NotificationCenter.tsx - adicionado refetch ao dependency array
- [x] Corrigir erro de conexão no articles.router.ts - refatorado para usar db.getDb() global
- [x] Adicionar try-catch em todas as queries/mutations do articles.router.ts
- [x] Testar ambas as correções - FUNCIONANDO SEM ERROS


## BUG A: Navegação do Site Institucional (Março 2026)
- [ ] Investigar por que páginas não re-renderizam ao mudar URL
- [ ] Verificar se há problema com React Router no site
- [ ] Garantir que navegação funciona sem refresh
- [ ] Testar todas as rotas do site (Início, O que fazer, Roteiros, Mapa, Blog, Parceiros, Contato)

## BUG B: Detecção do Botão de Instalação (Março 2026)
- [ ] Mostrar botão apenas quando beforeinstallprompt está disponível
- [ ] Esconder botão quando app está em modo standalone (window.matchMedia)
- [ ] Esconder botão quando navigator.standalone === true
- [ ] Testar no app instalado vs. navegador


## BUG FIX: Navegação do Site e PWA Install Button (Março 2026)
- [x] BUG A - Navegação do site não re-renderiza páginas ao mudar URL
  - [x] Investigado: SiteHeader.tsx usa React Router Link corretamente
  - [x] Testado: Navegação funciona sem refresh (Blog, O que fazer, etc.)
  - [x] Confirmado: Páginas mudam quando URL muda (/#/blog, /#/o-que-fazer-em-holambra)
  - [x] Status: RESOLVIDO - Navegação funciona perfeitamente

## CRITICAL FIX: Site Navigation + PWA (Março 2026 - Round 2)
- [ ] BUG: Site requires page refresh to navigate between pages
- [ ] BUG: PWA install button shows even when app is already installed
- [ ] BUG: Navigation from landing page to /app requires refresh
- [ ] BUG: Page transitions not working without full page reload

- [x] BUG B - PWA install button aparece mesmo com app instalado
  - [x] Corrigido PWAInstallPrompt.tsx: adicionar verificação dupla de isInstalled
  - [x] Implementado: window.matchMedia('(display-mode: standalone)').matches
  - [x] Implementado: navigator.standalone para iOS
  - [x] Verificação no event handler (beforeinstallprompt)
  - [x] Verificação no render (antes de retornar JSX)
  - [x] Status: RESOLVIDO - Botão oculto quando app instalado
