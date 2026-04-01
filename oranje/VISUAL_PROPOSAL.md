# 🌷 ORANJE — Proposta Visual de Redesign

> Documento visual com diagramas ASCII mostrando exatamente como cada seção ficará
> após a implementação do redesign. Referência rápida para aprovação.

---

## 🎨 Paleta de Cores (Referência Visual)

```
╔═══════════════════════════════════════════════════════════════════╗
║  CORES DO REDESIGN                                               ║
╠═══════════════════════════════════════════════════════════════════╣
║                                                                   ║
║  ████████  #FFFFFF   Branco       → Fundo seções ímpares         ║
║  ████████  #F5F5DC   Bege         → Fundo seções pares           ║
║  ████████  #00251A   Verde Escuro → Header, Footer, textos       ║
║  ████████  #004D40   Verde Médio  → Ícones, texto secundário     ║
║  ████████  #E65100   Laranja      → Botões CTA, links de ação   ║
║                                                                   ║
╚═══════════════════════════════════════════════════════════════════╝
```

**Regra de alternância de fundo:**
```
Seção 1 (Hero)        → Imagem full-width + overlay verde escuro
Seção 2 (Categorias)  → #FFFFFF (branco)
Seção 3 (Destaques)   → #F5F5DC (bege)
Seção 4 (Roteiros)    → #FFFFFF (branco)
Seção 5 (Mapa)        → #F5F5DC (bege)
Seção 6 (Eventos)     → #FFFFFF (branco)
Seção 7 (Público)     → #F5F5DC (bege)
Seção 8 (Parceiros)   → #FFFFFF (branco)
Seção 9 (Instalar)    → #00251A (verde escuro forte)
Footer                 → #00251A (verde escuro)
```

---

## 1. HEADER — Layout Desktop & Mobile

### Desktop (largura > 768px)

```
┌─────────────────────────────────────────────────────────────────────────┐
│  ██ #00251A (verde escuro sólido) — fica fixo no topo                  │
│                                                                         │
│  ┌─────────────────── max-width: 1280px ───────────────────┐           │
│  │                                                          │           │
│  │  🌷 Logo       Início  O que fazer  Roteiros  Mapa      │           │
│  │  (branco)      Blog  Parceiros  Contato   [Abrir o App] │           │
│  │                                                          │           │
│  │  ← logo       ← nav links (centro) →    CTA laranja →  │           │
│  │                                                          │           │
│  └──────────────────────────────────────────────────────────┘           │
│                                                                         │
│  Altura: 68px (padrão) → 60px (ao rolar)                              │
│  Ao rolar: glassmorphism rgba(0,37,26,0.95) + blur(12px) + sombra     │
└─────────────────────────────────────────────────────────────────────────┘
```

**Detalhes dos links:**
```
  Estado normal:    cor rgba(255,255,255,0.8)  |  fundo transparente
  Estado hover:     cor #FFFFFF                |  fundo rgba(255,255,255,0.08)
  Estado ativo:     cor #E65100 (laranja)      |  fundo rgba(230,81,0,0.12)
```

**Botão CTA "Abrir o App":**
```
  ┌──────────────┐
  │ Abrir o App  │  ← fundo #E65100 (laranja), texto branco
  └──────────────┘     border-radius: 8px, padding: 8px 16px
```

### Mobile (largura ≤ 768px)

```
┌──────────────────────────────┐
│  🌷 Logo              ☰     │  ← hamburger menu (44x44px touch target)
│  ██████ #00251A ████████████ │
└──────────────────────────────┘
         │
         │ ao clicar no ☰
         ▼
┌──────────────────────────────┐ ┌──────────────────┐
│  ████ backdrop escuro ██████ │ │  NAVEGAÇÃO        │ ← slide-in da direita
│  ████ (blur + opacity) █████ │ │                    │    largura: min(320px, 85vw)
│  ████████████████████████████ │ │  🧭 Início     → │    fundo: #00251A
│  ████████████████████████████ │ │  📍 O que fazer   │
│  ████████████████████████████ │ │  📅 Roteiros      │    ícones à esquerda
│  ████████████████████████████ │ │  📍 Mapa          │    seta → no item ativo
│  ████████████████████████████ │ │  📖 Blog          │
│  ████████████████████████████ │ │  👥 Parceiros     │    cor ativa: #E65100
│  ████████████████████████████ │ │  💬 Contato       │    fundo ativo:
│  ████████████████████████████ │ │                    │      rgba(230,81,0,0.15)
│  ████████████████████████████ │ │ ─────────────────  │
│  ████████████████████████████ │ │ [  Abrir o App →] │ ← CTA laranja full-width
│  ████████████████████████████ │ │  Guia de Holambra │
│  ████████████████████████████ │ └──────────────────┘
└──────────────────────────────┘
```

---

## 2. HERO SECTION

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│  ████████████████████████████████████████████████████████████████████   │
│  ███ Imagem de fundo: moinho de vento de Holambra (full-width) █████   │
│  ███ min-height: 85vh ██████████████████████████████████████████████   │
│  ███                                                            ████   │
│  ███      CURADORIA LOCAL • PARCEIROS VERIFICADOS               ████   │
│  ███      (texto pequeno, uppercase, 0.75rem)                   ████   │
│  ███                                                            ████   │
│  ███              Descubra Holambra                              ████   │
│  ███      (h1, clamp 2rem→3.5rem, branco, bold)                ████   │
│  ███                                                            ████   │
│  ███   Roteiros, lugares, eventos e serviços locais             ████   │
│  ███   — tudo em um só lugar. (subtítulo, branco 90%)           ████   │
│  ███                                                            ████   │
│  ███    ┌────────────────────────────────────────┐              ████   │
│  ███    │ 🔍 Buscar restaurantes, eventos...     │              ████   │
│  ███    └────────────────────────────────────────┘              ████   │
│  ███     ↑ glassmorphism: rgba(255,255,255,0.9)                 ████   │
│  ███       + blur(12px), radius 12px, h=52px                    ████   │
│  ███       sombra: 0 8px 32px rgba(0,0,0,0.15)                 ████   │
│  ███                                                            ████   │
│  ███    [Abrir o App →]    [ Ver Roteiros ]                     ████   │
│  ███     ↑ laranja CTA      ↑ borda branca                     ████   │
│  ███                                                            ████   │
│  ███         100+          50+          30+                     ████   │
│  ███        Lugares     Parceiros    Roteiros                   ████   │
│  ███        (stats: 1.75rem bold branco)                        ████   │
│  ███                                                            ████   │
│  ███                      ˅                                     ████   │
│  ███             (scroll indicator animado)                      ████   │
│  ████████████████████████████████████████████████████████████████████   │
│                                                                         │
│  Overlay: gradient de rgba(0,37,26,0.3) → rgba(0,37,26,0.6)           │
└─────────────────────────────────────────────────────────────────────────┘
```

### Hero Mobile

```
┌─────────────────────────┐
│ █████████████████████████│
│ ███ Imagem + overlay ████│
│ ███                  ████│
│ ███  CURADORIA LOCAL ████│
│ ███                  ████│
│ ███    Descubra      ████│
│ ███   Holambra       ████│
│ ███   (2rem)         ████│
│ ███                  ████│
│ ███  Roteiros, ...   ████│
│ ███                  ████│
│ ███ ┌──────────────┐████│
│ ███ │🔍 Buscar...  │████│
│ ███ └──────────────┘████│
│ ███                  ████│
│ ███ [Abrir o App →] ████│
│ ███ [Ver Roteiros]   ████│
│ ███                  ████│
│ ███  100+ 50+ 30+   ████│
│ ███                  ████│
│ ███       ˅          ████│
│ █████████████████████████│
└─────────────────────────┘
```

---

## 3. CATEGORIAS — Fundo Branco #FFFFFF

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Background: #FFFFFF                                                    │
│                                                                         │
│             ┌──────────────┐                                            │
│             │  Categorias  │  ← badge: laranja, pill shape, 0.6875rem  │
│             └──────────────┘                                            │
│              Explore por Categoria                                      │
│       Encontre exatamente o que você procura                           │
│                                                                         │
│  ┌─ Grid: auto-fill, minmax(280px, 1fr), gap 24px ──────────────────┐ │
│  │                                                                    │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐               │ │
│  │  │   ┌────┐    │  │   ┌────┐    │  │   ┌────┐    │               │ │
│  │  │   │ 🍴 │    │  │   │ ☕ │    │  │   │ 🍷 │    │               │ │
│  │  │   └────┘    │  │   └────┘    │  │   └────┘    │               │ │
│  │  │  56x56px    │  │  56x56px    │  │  56x56px    │               │ │
│  │  │  radius 16  │  │  radius 16  │  │  radius 16  │               │ │
│  │  │             │  │             │  │             │               │ │
│  │  │Restaurantes │  │   Cafés     │  │Bares&Drinks │               │ │
│  │  │ Pratos...   │  │ Cafeterias  │  │ Vida...     │               │ │
│  │  │             │  │             │  │             │               │ │
│  │  │ Explorar →  │  │ Explorar →  │  │ Explorar →  │               │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘               │ │
│  │                                                                    │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐               │ │
│  │  │   ┌────┐    │  │   ┌────┐    │  │   ┌────┐    │               │ │
│  │  │   │ 📷 │    │  │   │ 📅 │    │  │   │ 🗺️ │    │               │ │
│  │  │   └────┘    │  │   └────┘    │  │   └────┘    │               │ │
│  │  │  Pontos     │  │  Eventos    │  │  Roteiros   │               │ │
│  │  │ Turísticos  │  │ Agenda...   │  │ Passeios... │               │ │
│  │  │ Explorar →  │  │ Explorar →  │  │ Explorar →  │               │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘               │ │
│  └────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

**Detalhes do Card de Categoria:**
```
┌─────────────────────────────────────┐
│  site-card                          │
│  padding: 28px                      │
│  text-align: center                 │
│  border-radius: 12px                │
│  background: #FFFFFF                │
│  shadow: 0 2px 8px rgba(0,37,26,   │
│          0.08)                      │
│                                     │
│  HOVER:                             │
│  → shadow: 0 8px 24px ...0.12      │
│  → scale(1.02)                      │
│  → transition: 200ms               │
│                                     │
│  Ícone:                             │
│  └ 56x56px container               │
│  └ fundo rgba(0,37,26,0.06)        │
│  └ cor #00251A                      │
│  └ lucide-react 24px, stroke 2     │
│                                     │
│  Título: 1.125rem, bold, #00251A   │
│  Desc:   0.875rem, #00251A/55%     │
│  CTA:    0.875rem, bold, #E65100   │
│          "Explorar →"               │
└─────────────────────────────────────┘
```

### Categorias Mobile (2 colunas)

```
┌──────────────────────────┐
│  ┌──────────┐┌──────────┐│
│  │   🍴     ││   ☕     ││
│  │Restaurant││  Cafés   ││
│  │Explorar →││Explorar →││
│  └──────────┘└──────────┘│
│  ┌──────────┐┌──────────┐│
│  │   🍷     ││   📷     ││
│  │Bares     ││  Pontos  ││
│  │Explorar →││Explorar →││
│  └──────────┘└──────────┘│
│  ┌──────────┐┌──────────┐│
│  │   📅     ││   🗺️     ││
│  │Eventos   ││Roteiros  ││
│  │Explorar →││Explorar →││
│  └──────────┘└──────────┘│
└──────────────────────────┘
```

---

## 4. DESTAQUES DA SEMANA — Fundo Bege #F5F5DC

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Background: #F5F5DC (bege)                                            │
│                                                                         │
│             ┌──────────────┐                                            │
│             │  Destaques   │  ← badge: verde escuro, pill shape        │
│             └──────────────┘                                            │
│              Destaques da Semana                                        │
│         Lugares mais visitados e bem avaliados                         │
│                                                                         │
│  ┌─ Grid: auto-fill, minmax(300px, 1fr), gap 24px ──────────────────┐ │
│  │                                                                    │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐            │ │
│  │  │▓▓▓▓▓▓▓▓▓▓▓▓▓▓│  │▓▓▓▓▓▓▓▓▓▓▓▓▓▓│  │▓▓▓▓▓▓▓▓▓▓▓▓▓▓│            │ │
│  │  │▓▓ IMAGEM ▓▓▓▓│  │▓▓ IMAGEM ▓▓▓▓│  │▓▓ IMAGEM ▓▓▓▓│            │ │
│  │  │▓▓ 4:3    ▓▓▓▓│  │▓▓ 4:3    ▓▓▓▓│  │▓▓ 4:3    ▓▓▓▓│            │ │
│  │  │▓▓ aspect ▓▓▓▓│  │▓▓ aspect ▓▓▓▓│  │▓▓ aspect ▓▓▓▓│            │ │
│  │  │▒▒▒ gradient ▒│  │▒▒▒ gradient ▒│  │▒▒▒ gradient ▒│            │ │
│  │  ├──────────────┤  ├──────────────┤  ├──────────────┤            │ │
│  │  │ Nome do Lugar│  │ Nome do Lugar│  │ Nome do Lugar│            │ │
│  │  │ Categoria    │  │ Categoria    │  │ Categoria    │            │ │
│  │  │              │  │              │  │              │            │ │
│  │  │ ★ 4.5  [App]│  │ ★ 4.3  [App]│  │ ★ 4.7  [App]│            │ │
│  │  └──────────────┘  └──────────────┘  └──────────────┘            │ │
│  └────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

**Detalhes do Card de Destaque:**
```
┌──────────────────────────────────┐
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│ ← Imagem (paddingBottom: 75% = 4:3)
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│    object-fit: cover
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│    hover: scale(1.05) em 400ms
│ ▒▒▒▒▒▒ gradient overlay ▒▒▒▒▒▒▒│ ← 40% inferior com gradient para preto
├──────────────────────────────────┤
│ padding: 20px                    │
│                                  │
│ Restaurante Xe Rios              │ ← h3: 1.125rem, bold, #00251A
│ Restaurante                      │ ← 0.875rem, #00251A/55%
│                                  │
│ ★ 4.5              [Ver no app]  │ ← estrela: fill #E65100
│                      ↑ btn CTA   │    botão CTA laranja pequeno
└──────────────────────────────────┘
  border-radius: 12px
  shadow Level 1 → Level 2 no hover
```

**Loading State (Skeleton):**
```
┌──────────────────────────────────┐
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│ ← shimmer animation
│ ░░░░░░░░░░ (h=200px) ░░░░░░░░░░│    #e5e5e0 → #f5f5f0
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│
├──────────────────────────────────┤
│ ░░░░░░░░░░░░░░░░░ (70%, h=20px)│
│ ░░░░░░░░░░░ (50%, h=14px)      │
│ ░░░░░░░░ (40%, h=36px)         │
└──────────────────────────────────┘
```

---

## 5. ROTEIROS PRONTOS — Fundo Branco #FFFFFF

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Background: #FFFFFF                                                    │
│                                                                         │
│             ┌──────────────┐                                            │
│             │   Roteiros   │  ← badge laranja                          │
│             └──────────────┘                                            │
│               Roteiros Prontos                                          │
│       Passeios planejados para aproveitar Holambra                     │
│                                                                         │
│  ┌─ Grid: auto-fill, minmax(280px, 1fr), gap 24px ──────────────────┐ │
│  │                                                                    │ │
│  │  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐       │ │
│  │  │                │  │                │  │                │       │ │
│  │  │ Roteiro de     │  │ Roteiro        │  │ Dia Chuvoso    │       │ │
│  │  │ 1 Dia          │  │ Romântico      │  │                │       │ │
│  │  │                │  │                │  │ Atividades     │       │ │
│  │  │ Visite os      │  │ Experiências   │  │ cobertas e     │       │ │
│  │  │ principais...  │  │ especiais...   │  │ indoor...      │       │ │
│  │  │                │  │                │  │                │       │ │
│  │  │ 🕐 8h  [Abrir]│  │ 🕐 4h  [Abrir]│  │ 🕐 6h  [Abrir]│       │ │
│  │  └────────────────┘  └────────────────┘  └────────────────┘       │ │
│  └────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

**Card de Roteiro:**
```
┌──────────────────────────────────┐
│ padding: 28px                    │
│ border-radius: 12px              │
│                                  │
│ Roteiro de 1 Dia                 │ ← 1.25rem, bold, #00251A
│                                  │
│ Visite os principais pontos      │ ← 0.875rem, #00251A/55%
│ turísticos de Holambra em um     │    line-height: 1.6
│ dia completo.                    │    flex: 1 (empurra footer p/ baixo)
│                                  │
│ 🕐 8 horas            [Abrir]   │ ← ícone + texto #E65100
│                         ↑ CTA    │    botão laranja pequeno
└──────────────────────────────────┘
```

---

## 6. MAPA — Fundo Bege #F5F5DC

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Background: #F5F5DC (bege)                                            │
│                                                                         │
│  ┌─ Grid: 2 colunas, gap 48px, centralizado verticalmente ──────────┐ │
│  │                                                                    │ │
│  │  ┌── TEXTO ──────────────┐    ┌── PLACEHOLDER ──────────┐        │ │
│  │  │                       │    │                          │        │ │
│  │  │ ┌──────┐              │    │  ┌───────────────────┐  │        │ │
│  │  │ │ Mapa │ badge laranja│    │  │                   │  │        │ │
│  │  │ └──────┘              │    │  │    📍 (64px)      │  │        │ │
│  │  │                       │    │  │                   │  │        │ │
│  │  │ Navegue com           │    │  │ Mapa Interativo   │  │        │ │
│  │  │ Facilidade            │    │  │                   │  │        │ │
│  │  │                       │    │  │  site-card estilo │  │        │ │
│  │  │ Abra o mapa           │    │  │  padding: 48px    │  │        │ │
│  │  │ interativo e          │    │  │  fundo #FFFFFF    │  │        │ │
│  │  │ encontre o melhor     │    │  └───────────────────┘  │        │ │
│  │  │ caminho...            │    │                          │        │ │
│  │  │                       │    └──────────────────────────┘        │ │
│  │  │ [Abrir Mapa →]        │                                        │ │
│  │  │  ↑ CTA laranja        │                                        │ │
│  │  └───────────────────────┘                                        │ │
│  └────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 7. EVENTOS & AGENDA — Fundo Branco #FFFFFF

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Background: #FFFFFF                                                    │
│                                                                         │
│             ┌──────────────┐                                            │
│             │   Agenda     │  ← badge laranja                          │
│             └──────────────┘                                            │
│              Eventos & Agenda                                           │
│       Não perca o que está acontecendo em Holambra                     │
│                                                                         │
│  ┌── Lista vertical, gap 16px ──────────────────────────────────────┐  │
│  │                                                                   │  │
│  │  ┌─────────────────────────────────────────────────────────────┐ │  │
│  │  │  Título do Artigo 1                              →         │ │  │
│  │  │  19/03/2026                                                 │ │  │
│  │  └─────────────────────────────────────────────────────────────┘ │  │
│  │                                                                   │  │
│  │  ┌─────────────────────────────────────────────────────────────┐ │  │
│  │  │  Título do Artigo 2                              →         │ │  │
│  │  │  18/03/2026                                                 │ │  │
│  │  └─────────────────────────────────────────────────────────────┘ │  │
│  │                                                                   │  │
│  │  ┌─────────────────────────────────────────────────────────────┐ │  │
│  │  │  Título do Artigo 3                              →         │ │  │
│  │  │  17/03/2026                                                 │ │  │
│  │  └─────────────────────────────────────────────────────────────┘ │  │
│  │                                                                   │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│                    [Ver Agenda Completa →]                              │
│                      ↑ CTA laranja centralizado                        │
└─────────────────────────────────────────────────────────────────────────┘
```

**Card de Evento:**
```
┌──────────────────────────────────────────────────┐
│  site-card, padding: 20px 24px                   │
│  display: flex, align-items: center              │
│  justify-content: space-between                  │
│                                                  │
│  Título do Evento             → (seta laranja)   │
│  19/03/2026 (data)                               │
│                                                  │
│  Título: 1.0625rem, bold, #00251A               │
│  Data: 0.8125rem, #00251A/45%                   │
│  Seta: ArrowRight 20px, #E65100                 │
└──────────────────────────────────────────────────┘
```

---

## 8. SEÇÃO INSTALAR APP — Fundo Verde Escuro #00251A

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Background: #00251A (verde escuro) — padding: 80px 24px               │
│  max-width: 768px centralizado                                         │
│                                                                         │
│              Instale o Oranje                                           │
│       (h2, branco, bold, clamp 1.75rem→2.5rem)                        │
│                                                                         │
│       Use Oranje como um app nativo no seu celular                     │
│       (subtítulo, branco 85%)                                          │
│                                                                         │
│  ┌─ Grid: 3 colunas ────────────────────────────────────────────────┐  │
│  │                                                                   │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │  │
│  │  │ rgba(fff,0.08)│  │ rgba(fff,0.08)│  │ rgba(fff,0.08)│           │  │
│  │  │ + blur(8px)   │  │ + blur(8px)   │  │ + blur(8px)   │           │  │
│  │  │               │  │               │  │               │           │  │
│  │  │  1            │  │  2            │  │  3            │           │  │
│  │  │  Abra o       │  │  Toque em     │  │  Use como     │           │  │
│  │  │  Oranje       │  │  Instalar     │  │  App          │           │  │
│  │  │  Acesse...    │  │  Procure...   │  │  Acesse...    │           │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘           │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  📱 iPhone: Toque em Compartilhar → Adicionar à Tela de Início │   │
│  │  🤖 Android: Toque no menu (⋮) → Instalar app                  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│     ↑ fundo rgba(fff,0.06), borda rgba(fff,0.1), radius 12px          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 9. FOOTER — Fundo Verde Escuro #00251A

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Background: #00251A                                                    │
│  max-width: 1280px, padding: 3.5rem 1.5rem 2rem                       │
│                                                                         │
│  ┌─ Grid: auto-fit, minmax(200px, 1fr), gap 2.5rem ────────────────┐  │
│  │                                                                   │  │
│  │  🌷 Logo             NAVEGAÇÃO        LEGAL          CONTATO     │  │
│  │  (branco, 32px h)    (label cinza)    (label cinza)  (label)     │  │
│  │                                                                   │  │
│  │  O guia definitivo   Início           Privacidade    ✉ email     │  │
│  │  de Holambra...      O que fazer      Termos         📞 tel      │  │
│  │  (texto 55% branco)  Roteiros         Abrir App      📍 Holambra │  │
│  │                      Blog                                         │  │
│  │                      Parceiros        hover: #E65100              │  │
│  │                                       (laranja)                   │  │
│  │                      hover: #E65100                               │  │
│  │                      (laranja)                                    │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  ─────────────── border-top: rgba(255,255,255,0.08) ────────────────   │
│                                                                         │
│  © 2026 Oranje. Todos os direitos reservados.        [Instagram]       │
│  (35% branco)                                         (40% branco →    │
│                                                        hover #E65100)  │
└─────────────────────────────────────────────────────────────────────────┘
```

### Footer Mobile

```
┌──────────────────────────┐
│  🌷 Logo                 │
│  O guia definitivo...    │
│                          │
│  NAVEGAÇÃO               │
│  Início                  │
│  O que fazer             │
│  Roteiros                │
│  Blog                    │
│  Parceiros               │
│                          │
│  LEGAL                   │
│  Privacidade             │
│  Termos                  │
│  Abrir App               │
│                          │
│  CONTATO                 │
│  ✉ contato@oranje.com.br│
│  📞 (19) 4000-0000      │
│  📍 Holambra, SP         │
│                          │
│  ──────────────────────  │
│  © 2026 Oranje     [IG]  │
└──────────────────────────┘
```

---

## 🔁 Fluxo Completo da Página (Scroll Vertical)

```
┌──────────────────────────────────┐
│ █ HEADER (sticky, verde escuro)  │ ← sempre fixo no topo
├──────────────────────────────────┤
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│
│ ▓▓     HERO (imagem + overlay)  ▓│ ← 85vh
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│
├──────────────────────────────────┤
│ □□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□│
│ □□  CATEGORIAS (branco #FFF)   □□│
│ □□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□│
├──────────────────────────────────┤
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│
│ ░░  DESTAQUES (bege #F5F5DC)   ░░│
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│
├──────────────────────────────────┤
│ □□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□│
│ □□  ROTEIROS (branco #FFF)     □□│
│ □□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□│
├──────────────────────────────────┤
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│
│ ░░  MAPA (bege #F5F5DC)        ░░│
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│
├──────────────────────────────────┤
│ □□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□│
│ □□  EVENTOS (branco #FFF)      □□│
│ □□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□│
├──────────────────────────────────┤
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│
│ ░░  PÚBLICO (bege #F5F5DC)     ░░│
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│
├──────────────────────────────────┤
│ □□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□│
│ □□  PARCEIROS (branco #FFF)    □□│
│ □□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□│
├──────────────────────────────────┤
│ ████████████████████████████████ │
│ ██  INSTALAR (verde #00251A)  ██ │
│ ████████████████████████████████ │
├──────────────────────────────────┤
│ ████████████████████████████████ │
│ ██  FOOTER (verde #00251A)    ██ │
│ ████████████████████████████████ │
└──────────────────────────────────┘
```

---

## ✨ Animações e Interações

### Scroll Reveal (todas as seções)
```
  Antes de aparecer:    opacity: 0, translateY(24px)
  Ao entrar na tela:    opacity: 1, translateY(0)
  Transição:            0.6s cubic-bezier(0.4, 0, 0.2, 1)
  Delay escalonado:     80-100ms entre itens do grid
  Trigger:              IntersectionObserver threshold 0.12
```

### Card Hover
```
  Normal:    shadow Level 1  (0 2px 8px ...)
  Hover:     shadow Level 2  (0 8px 24px ...) + scale(1.02)
  Transição: 200ms ease
```

### CTA Button Hover
```
  Normal:    background #E65100
  Hover:     translateY(-1px) + sombra mais intensa
  Transição: 200ms ease
```

### Header Scroll
```
  Em cima:   sólido #00251A, h=68px, sem sombra
  Rolou:     rgba(0,37,26,0.95) + blur(12px), h=60px, sombra
  Transição: 300ms cubic-bezier(0.4, 0, 0.2, 1)
```

---

## 📐 Espaçamento

```
  Spacing System (múltiplos de 8px):
  ┌────┬─────┬──────┐
  │ xs │ 8px │      │
  │ sm │16px │ █    │
  │ md │24px │ ██   │
  │ lg │32px │ ███  │
  │ xl │48px │ █████│
  │2xl │64px │ ██████│
  │3xl │96px │ █████████│
  └────┴─────┴──────┘

  Seções: padding vertical ~64-96px (site-section class)
  Max-width do conteúdo: 1280px
  Padding lateral: 24px (mobile) → 24px (desktop via max-width)
```

---

## ♿ Acessibilidade

```
  ✅ Contraste: 7:1+ (WCAG AAA)
  ✅ Touch targets: 44x44px mínimo (hamburger, botões)
  ✅ Skip link: "Pular para conteúdo" (sr-only)
  ✅ aria-label em todos os botões e links de ícone
  ✅ aria-current="page" no link ativo
  ✅ aria-expanded no menu mobile
  ✅ Focus: outline #E65100
  ✅ Keyboard nav completa
  ✅ Lazy loading em imagens
```

---

*Documento visual criado em 19/03/2026 — Referência para aprovação do redesign*
