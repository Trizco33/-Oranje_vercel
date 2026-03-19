# Oranje — Refined Visual Proposal

> Design philosophy: **Clean. Minimal. Premium.** Think Apple meets boutique travel.
> No glassmorphism. No skeleton loaders. No visual noise. Every pixel earns its place.

---

## 1. Design Principles

| Principle | What it means |
|-----------|--------------|
| **Breathe** | Generous whitespace between every element. Let content float, not stack. |
| **Quiet luxury** | Subtle shadows, restrained color, premium typography. Nothing screams. |
| **Content first** | Large images, clear hierarchy, readable text. UI disappears, content shines. |
| **Mobile native** | Designed for thumbs first, scaled up for desktop second. |

---

## 2. Color System (unchanged)

```
Primary Background:    #FFFFFF  (white sections)
Secondary Background:  #F5F5DC  (beige sections — warm, inviting)
Primary Brand:         #00251A  (dark green — header, footer, headings)
Secondary Brand:       #004D40  (medium green — secondary text)
CTA:                   #E65100  (warm orange — buttons, links)
CTA Hover:             #BF4500  (darker orange)
Text Primary:          #00251A  on light backgrounds
Text Secondary:        #4A6B5D  on light backgrounds (muted green)
Text on Dark:          #FFFFFF
Text Muted on Dark:    #A8C5B8
```

---

## 3. Typography Scale (Montserrat)

All sizes use `rem`. Line heights are generous for readability.

```
Hero Title:        clamp(2.5rem, 5vw, 4rem)    / 700  / line-height: 1.1  / letter-spacing: -0.02em
Section Title:     clamp(1.75rem, 3vw, 2.5rem) / 700  / line-height: 1.2  / letter-spacing: -0.01em
Section Subtitle:  clamp(1rem, 1.5vw, 1.125rem)/ 400  / line-height: 1.6  / color: #4A6B5D
Card Title:        1.125rem (18px)              / 600  / line-height: 1.3
Card Description:  0.875rem (14px)              / 400  / line-height: 1.5  / color: #4A6B5D
Caption/Meta:      0.75rem  (12px)              / 500  / line-height: 1.4  / uppercase, letter-spacing: 0.08em
Button Text:       0.875rem (14px)              / 600  / letter-spacing: 0.02em
Nav Link:          0.875rem (14px)              / 500
```

---

## 4. Spacing System

Use a **fluid spacing scale** — not rigid 8px grid. Sections breathe.

```
Section padding (vertical):
  Mobile:   64px  (4rem)
  Tablet:   80px  (5rem)
  Desktop:  96px  (6rem)

Between sections:  0px (backgrounds handle separation)
Container max-width: 1200px
Container padding:
  Mobile:   20px each side
  Tablet:   32px each side
  Desktop:  40px each side

Between section title and content:  40px (2.5rem) mobile / 48px (3rem) desktop
Between cards (gap):                20px mobile / 24px desktop
Card internal padding:              0 (image bleeds to edges, text below)
```

---

## 5. Elevation & Shadows

Only two levels. Restrained.

```
Card resting:     box-shadow: 0 1px 3px rgba(0, 37, 26, 0.06)
Card hover:       box-shadow: 0 8px 24px rgba(0, 37, 26, 0.10)
                  transform: translateY(-2px)
                  transition: all 0.3s ease

Header shadow:    box-shadow: 0 1px 0 rgba(0, 37, 26, 0.08)
                  (thin line, not a cloud of shadow)
```

No other shadows in the entire UI.

---

## 6. Section-by-Section Design

---

### 6.1 Header — Solid, Clean, Confident

No glassmorphism. No blur. Solid dark green. Thin and precise.

```
Height: 64px (mobile) / 72px (desktop)
Background: #00251A (solid, always)
Position: sticky, top: 0, z-index: 50
Border-bottom: 1px solid rgba(255,255,255,0.08) (very subtle)
```

#### Desktop Layout (≥ 1024px)
```
┌──────────────────────────────────────────────────────────────────┐
│  ◇ Oranje              Home  O que fazer  Roteiros  Mapa  Blog  │
│  GUIA CULTURAL          Parceiros  Contato        [Abrir o App] │
│                                                                  │
│  ← 40px →   logo       ← nav links, 32px gap →    ← CTA btn →  │
└──────────────────────────────────────────────────────────────────┘

Logo:       White, height 28px
Nav links:  #FFFFFF, opacity 0.7 → opacity 1 on hover (0.2s ease)
Active:     #FFFFFF, opacity 1, font-weight 600
CTA btn:    background #E65100, color #FFF, border-radius 8px,
            padding 10px 20px, hover → #BF4500
```

#### Mobile Layout (< 1024px)
```
┌──────────────────────────────────────┐
│  ◇ Oranje                      ☰    │
│  GUIA CULTURAL                       │
└──────────────────────────────────────┘

Height: 56px
Hamburger: 24x24, white, right-aligned
```

#### Mobile Menu (slide from right)
```
┌──────────────────────────────────────┐
│                                 ✕    │  ← 56px top bar
├──────────────────────────────────────┤
│                                      │
│    Home                              │  ← each link: padding 16px 24px
│    ─────────────────────────────     │     font-size: 1rem, weight 500
│    O que fazer                       │     border-bottom: 1px solid
│    ─────────────────────────────     │       rgba(255,255,255,0.08)
│    Roteiros                          │
│    ─────────────────────────────     │
│    Mapa                              │
│    ─────────────────────────────     │
│    Blog                              │
│    ─────────────────────────────     │
│    Parceiros                         │
│    ─────────────────────────────     │
│    Contato                           │
│                                      │
│    ┌────────────────────────────┐    │
│    │       Abrir o App →        │    │  ← full-width CTA, 24px margin
│    └────────────────────────────┘    │
│                                      │
└──────────────────────────────────────┘

Background: #00251A (solid)
Overlay behind: rgba(0, 0, 0, 0.5) — covers page
Animation: translateX(100%) → translateX(0), 0.3s ease
```

---

### 6.2 Hero — Bold, Immersive, Inviting

Full-width image with text overlay. The first impression.

```
Height: 85vh mobile / 75vh desktop (min: 500px, max: 700px)
```

#### Desktop
```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│              ┌─────────────────────────────────┐                 │
│              │     (Holambra windmill photo)    │                 │
│              │     Full-width background        │                 │
│              │     object-fit: cover             │                 │
│              │                                   │                 │
│              │                                   │                 │
│   ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   │                 │
│   ░                                          ░   │                 │
│   ░    Descubra                              ░   │                 │
│   ░    Holambra                              ░   │                 │
│   ░                                          ░   │ gradient:      │
│   ░    A cidade das flores                   ░   │ bottom 50%     │
│   ░    espera por você.                      ░   │ rgba(0,37,26,  │
│   ░                                          ░   │ 0) → (0,37,26, │
│   ░    [🔍  Buscar restaurantes, eventos...] ░   │ 0.7)           │
│   ░                                          ░   │                 │
│   ░    [Abrir o App →]   [Ver Roteiros]      ░   │                 │
│   ░                                          ░   │                 │
│   ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   │                 │
│                                                  │                 │
│              └─────────────────────────────────┘                 │
└──────────────────────────────────────────────────────────────────┘
```

#### Text alignment: left on desktop, center on mobile

```
Title:          "Descubra Holambra"
                clamp(2.5rem, 5vw, 4rem) / 700 / white
                margin-bottom: 16px

Subtitle:       "A cidade das flores espera por você."
                clamp(1rem, 1.5vw, 1.25rem) / 400 / rgba(255,255,255,0.85)
                margin-bottom: 32px

Search bar:     background: #FFFFFF
                border-radius: 12px
                padding: 14px 20px
                box-shadow: 0 2px 8px rgba(0,0,0,0.12)
                placeholder: "Buscar restaurantes, eventos, lugares..."
                color: #4A6B5D
                font-size: 0.9375rem
                width: 100%, max-width: 520px
                margin-bottom: 24px
                NO blur, NO transparency — solid white

CTA primary:    "Abrir o App →"
                bg: #E65100, color: #FFF, border-radius: 10px
                padding: 14px 28px, font-weight: 600
                hover: bg #BF4500, translateY(-1px)

CTA secondary:  "Ver Roteiros"
                bg: transparent, color: #FFF
                border: 1.5px solid rgba(255,255,255,0.5)
                border-radius: 10px
                padding: 14px 28px
                hover: border-color #FFF, bg rgba(255,255,255,0.05)

Button gap:     16px
```

#### Mobile Hero
```
┌──────────────────────────────────┐
│                                  │
│      (Holambra windmill)         │
│      Full-width, 85vh            │
│                                  │
│                                  │
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │
│  ░                            ░  │
│  ░       Descubra             ░  │
│  ░       Holambra             ░  │
│  ░                            ░  │
│  ░   A cidade das flores      ░  │
│  ░   espera por você.         ░  │
│  ░                            ░  │
│  ░  [🔍 Buscar restauran...] ░  │
│  ░                            ░  │
│  ░  [    Abrir o App →     ]  ░  │
│  ░  [    Ver Roteiros      ]  ░  │
│  ░                            ░  │
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │
│                                  │
└──────────────────────────────────┘

Text: centered
Buttons: full-width, stacked, 12px gap
Search bar: full-width, margin 0 20px
```

#### Stats strip (below hero, optional)
```
┌──────────────────────────────────────────────────────────────────┐
│       100+ Lugares       50+ Parceiros       30+ Roteiros       │
│                     bg: #00251A, color: #FFF                    │
│                     padding: 20px 0                             │
│                     font-size: 0.875rem / 500                   │
│                     numbers: 1.25rem / 700                      │
└──────────────────────────────────────────────────────────────────┘
```

---

### 6.3 Categories — Clean Grid with Room to Breathe

Background: `#FFFFFF`

```
Section title:      "Explore por Categoria"
Section subtitle:   "Encontre exatamente o que você procura"
```

#### Desktop (6 items, in a row of 6 or 2 rows of 3)
```
bg: #FFFFFF
padding: 96px 0

         Explore por Categoria
    Encontre exatamente o que você procura

    ← 48px gap below subtitle →

    ┌─────┐    ┌─────┐    ┌─────┐    ┌─────┐    ┌─────┐    ┌─────┐
    │     │    │     │    │     │    │     │    │     │    │     │
    │  🍽  │    │  ☕  │    │  📍  │    │  🎪  │    │  🎫  │    │  🎁  │
    │     │    │     │    │     │    │     │    │     │    │     │
    └─────┘    └─────┘    └─────┘    └─────┘    └─────┘    └─────┘
  Restaurantes   Cafés    Pontos    Festas &    Eventos    Presentes
                         Turísticos Tradições

  Each card:
    - width: flexible (1fr in grid)
    - icon container: 56px × 56px, border-radius: 14px
      bg: #F5F5DC (beige), centered
    - icon: 24px, color #00251A
    - label: 0.875rem / 600 / #00251A, margin-top: 12px
    - text-align: center
    - cursor: pointer
    - hover: icon container bg → #E8E4C9 (slightly darker beige)
             translateY(-2px), 0.2s ease
    - gap between cards: 16px
```

#### Mobile (2 columns, 3 rows)
```
┌──────────────────────────────────┐
│                                  │
│    Explore por Categoria         │
│    Encontre o que procura        │
│                                  │
│    ┌────────┐   ┌────────┐      │
│    │   🍽   │   │   ☕   │      │
│    │Restaur.│   │ Cafés  │      │
│    └────────┘   └────────┘      │
│                                  │
│    ┌────────┐   ┌────────┐      │
│    │   📍   │   │   🎪   │      │
│    │Pontos  │   │Festas  │      │
│    └────────┘   └────────┘      │
│                                  │
│    ┌────────┐   ┌────────┐      │
│    │   🎫   │   │   🎁   │      │
│    │Eventos │   │Presentes│     │
│    └────────┘   └────────┘      │
│                                  │
└──────────────────────────────────┘

Grid: 2 columns, gap: 16px
Padding: 64px 20px
```

---

### 6.4 Featured Places — Premium Cards, Large Images

Background: `#F5F5DC` (beige)

This is the hero section of content. Cards should feel like a travel magazine.

```
Section label:      "DESTAQUES" (caption style — 0.75rem, uppercase, 
                     letter-spacing 0.08em, color #E65100, font-weight 600)
Section title:      "Destaques da Semana"
Section subtitle:   "Lugares mais visitados e bem avaliados"
```

#### Desktop (3 cards in a row)
```
bg: #F5F5DC
padding: 96px 0

             DESTAQUES
        Destaques da Semana
   Lugares mais visitados e bem avaliados

   ← 48px →

   ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
   │                  │  │                  │  │                  │
   │   ┌──────────┐   │  │   ┌──────────┐   │  │   ┌──────────┐   │
   │   │          │   │  │   │          │   │  │   │          │   │
   │   │  IMAGE   │   │  │   │  IMAGE   │   │  │   │  IMAGE   │   │
   │   │  3:2     │   │  │   │  3:2     │   │  │   │  3:2     │   │
   │   │  ratio   │   │  │   │  ratio   │   │  │   │  ratio   │   │
   │   │          │   │  │   │          │   │  │   │          │   │
   │   └──────────┘   │  │   └──────────┘   │  │   └──────────┘   │
   │                  │  │                  │  │                  │
   │   Restaurante    │  │   Café Moinho    │  │   Recanto do     │
   │   De Rios        │  │                  │  │   Taipas          │
   │                  │  │   ★ 4.5          │  │                  │
   │   ★ 4.8          │  │                  │  │   ★ 4.3          │
   │                  │  │   Ver no app →   │  │                  │
   │   Ver no app →   │  │                  │  │   Ver no app →   │
   │                  │  │                  │  │                  │
   └──────────────────┘  └──────────────────┘  └──────────────────┘

   Grid: 3 columns, gap: 24px

   Card specs:
     background: #FFFFFF
     border-radius: 16px
     overflow: hidden
     box-shadow: 0 1px 3px rgba(0, 37, 26, 0.06)
     transition: all 0.3s ease

     hover:
       box-shadow: 0 8px 24px rgba(0, 37, 26, 0.10)
       translateY(-2px)

     Image:
       width: 100%
       aspect-ratio: 3 / 2
       object-fit: cover
       border-radius: 16px 16px 0 0

     Text area:
       padding: 20px

     Card title:
       font-size: 1.125rem / 600 / #00251A
       margin-bottom: 8px

     Rating:
       font-size: 0.8125rem / 500 / #4A6B5D
       ★ icon color: #E65100
       margin-bottom: 12px

     CTA link:
       font-size: 0.8125rem / 600 / #E65100
       hover: underline
       "Ver no app →"
```

#### Mobile (horizontal scroll)
```
┌──────────────────────────────────┐
│                                  │
│    DESTAQUES                     │
│    Destaques da Semana           │
│    Lugares mais visitados        │
│                                  │
│  ┌────────────┐ ┌────────────┐  │
│  │            │ │            │  │ ← horizontal scroll
│  │   IMAGE    │ │   IMAGE    │──┤   (overflow-x: auto)
│  │   3:2      │ │   3:2      │  │   snap: x mandatory
│  │            │ │            │  │
│  ├────────────┤ ├────────────┤  │
│  │ Restaurante│ │ Café       │  │
│  │ De Rios    │ │ Moinho     │  │
│  │ ★ 4.8     │ │ ★ 4.5     │  │
│  │ Ver →     │ │ Ver →     │  │
│  └────────────┘ └────────────┘  │
│                                  │
└──────────────────────────────────┘

Mobile card width: 280px (fixed)
Gap: 16px
Scroll padding: 20px (matches container)
Hide scrollbar: -webkit-scrollbar { display: none }
Scroll snap: scroll-snap-type: x mandatory
             scroll-snap-align: start (each card)
```

---

### 6.5 Roteiros (Routes) — Curated Itineraries

Background: `#FFFFFF`

```
Section label:     "ROTEIROS" (caption, #E65100)
Section title:     "Roteiros Prontos"
Section subtitle:  "Passeios planejados para aproveitar Holambra"
```

#### Desktop (3 cards)
```
bg: #FFFFFF
padding: 96px 0

              ROTEIROS
         Roteiros Prontos
   Passeios planejados para aproveitar Holambra

   ← 48px →

   ┌─────────────────────────────────────────────────────────────┐
   │                                                             │
   │  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
   │  │                 │ │                 │ │                 │
   │  │   Rolê de 1 Dia │ │ Roteiro         │ │  48 Horas      │
   │  │                 │ │ Romântico       │ │                 │
   │  │   Dicas para    │ │                 │ │  Atividades     │
   │  │   curtir seus   │ │ Experiências    │ │  para curtir    │
   │  │   melhores      │ │ especiais para  │ │  dois dias      │
   │  │   passeios      │ │ casais          │ │  inteiros       │
   │  │                 │ │                 │ │                 │
   │  │   ⏱ 12 horas   │ │ ⏱ 24 horas     │ │  ⏱ 2a horas    │
   │  │                 │ │                 │ │                 │
   │  │   [  Abrir  ]   │ │   [  Abrir  ]   │ │   [  Abrir  ]   │
   │  │                 │ │                 │ │                 │
   │  └─────────────────┘ └─────────────────┘ └─────────────────┘
   │                                                             │
   └─────────────────────────────────────────────────────────────┘

   Card specs:
     background: #F5F5DC (beige on white background — inverted)
     border-radius: 16px
     padding: 32px 28px
     border: none
     NO shadow (flat on white, beige is enough contrast)

     hover:
       background: #EDE9D0 (slightly darker beige)
       transition: background 0.2s ease

     Title:
       1.125rem / 700 / #00251A
       margin-bottom: 8px

     Description:
       0.875rem / 400 / #4A6B5D
       margin-bottom: 16px

     Duration:
       0.75rem / 500 / #4A6B5D
       ⏱ icon inline, color #E65100
       margin-bottom: 20px

     CTA button:
       bg: #00251A, color: #FFF, border-radius: 8px
       padding: 10px 24px, font-size: 0.8125rem / 600
       hover: bg #004D40
       width: auto (not full-width)
```

#### Mobile (stacked, full-width cards)
```
┌──────────────────────────────────┐
│                                  │
│    ROTEIROS                      │
│    Roteiros Prontos              │
│                                  │
│    ┌────────────────────────┐    │
│    │  Rolê de 1 Dia         │    │
│    │  Dicas para curtir     │    │
│    │  ⏱ 12 horas           │    │
│    │        [ Abrir ]       │    │
│    └────────────────────────┘    │
│                                  │  ← 16px gap between cards
│    ┌────────────────────────┐    │
│    │  Roteiro Romântico     │    │
│    │  Experiências para     │    │
│    │  casais                │    │
│    │  ⏱ 24 horas           │    │
│    │        [ Abrir ]       │    │
│    └────────────────────────┘    │
│                                  │
│    ┌────────────────────────┐    │
│    │  48 Horas              │    │
│    │  Dois dias inteiros    │    │
│    │  ⏱ 2a horas           │    │
│    │        [ Abrir ]       │    │
│    └────────────────────────┘    │
│                                  │
└──────────────────────────────────┘

Cards: full-width, stacked
Padding: 24px 20px per card
```

---

### 6.6 Map Section — Minimal and Functional

Background: `#F5F5DC` (beige)

Keep this **small and purposeful**. No huge empty blocks.

#### Desktop
```
bg: #F5F5DC
padding: 96px 0

   ┌─────────────────────────────────────────────────────────────┐
   │                                                             │
   │   📍                                                        │
   │                                                             │
   │   Mapa Interativo                                           │
   │                                                             │
   │   Explore Holambra no mapa. Encontre                        │
   │   restaurantes, cafés e pontos turísticos                   │
   │   perto de você.                                            │
   │                                                             │
   │   [ Abrir Mapa → ]                                          │
   │                                                             │
   └─────────────────────────────────────────────────────────────┘

   Layout: centered text block, max-width: 480px
   Icon: 📍 or map-pin from lucide, 32px, color #E65100
   Title: 1.5rem / 700 / #00251A, margin-top: 16px
   Description: 0.9375rem / 400 / #4A6B5D, margin-top: 12px
   CTA: margin-top: 24px, same style as secondary CTA
        bg: #00251A, color: #FFF, border-radius: 10px
        padding: 12px 28px
        → icon after text
```

#### Mobile (same layout, centered)
```
┌──────────────────────────────────┐
│                                  │
│            📍                    │
│                                  │
│      Mapa Interativo             │
│                                  │
│   Explore Holambra no mapa.      │
│   Encontre restaurantes, cafés   │
│   e pontos turísticos.           │
│                                  │
│      [ Abrir Mapa → ]           │
│                                  │
└──────────────────────────────────┘

Padding: 64px 20px
Text: centered
```

**No map preview image. No placeholder box.** Just clean text + CTA. The map opens on its own page.

---

### 6.7 Events & Agenda — Editorial Cards

Background: `#FFFFFF`

```
Section label:     "AGENDA" (caption, #E65100)
Section title:     "Eventos & Agenda"
Section subtitle:  "Não perca o que está acontecendo em Holambra"
```

#### Desktop (3 cards, horizontal layout)
```
bg: #FFFFFF
padding: 96px 0

                  AGENDA
            Eventos & Agenda
   Não perca o que está acontecendo em Holambra

   ← 48px →

   ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
   │                  │  │                  │  │                  │
   │  Os 10 Melhores  │  │  Roteiro         │  │  48 Horas em     │
   │  Restaurantes    │  │  Romântico       │  │  Holambra        │
   │  de Holambra     │  │                  │  │                  │
   │                  │  │  Experiências    │  │  Atividades      │
   │  Dicas e         │  │  para casais     │  │  para aproveitar │
   │  sugestões para  │  │  em Holambra     │  │  dois dias       │
   │  comer bem       │  │                  │  │  inteiros        │
   │                  │  │                  │  │                  │
   │  ⏱ 12 horas     │  │  ⏱ 24 horas     │  │  ⏱ 2a horas     │
   │                  │  │                  │  │                  │
   │  [ Abrir → ]     │  │  [ Abrir → ]     │  │  [ Abrir → ]     │
   │                  │  │                  │  │                  │
   └──────────────────┘  └──────────────────┘  └──────────────────┘

   Card specs:
     background: #FFFFFF
     border: 1px solid rgba(0, 37, 26, 0.08)
     border-radius: 16px
     padding: 28px 24px

     hover:
       border-color: rgba(0, 37, 26, 0.15)
       box-shadow: 0 4px 12px rgba(0, 37, 26, 0.06)
       transition: all 0.25s ease

     Title:
       1rem / 700 / #00251A
       margin-bottom: 8px

     Description:
       0.875rem / 400 / #4A6B5D
       margin-bottom: 16px
       display: -webkit-box, -webkit-line-clamp: 3

     Duration:
       0.75rem / 500 / #4A6B5D
       ⏱ icon inline, color: #E65100

     CTA:
       "Abrir →"
       0.8125rem / 600 / #E65100
       margin-top: 16px
       hover: underline
```

#### Mobile (stacked)
```
┌──────────────────────────────────┐
│                                  │
│    AGENDA                        │
│    Eventos & Agenda              │
│                                  │
│    ┌────────────────────────┐    │
│    │  Os 10 Melhores        │    │
│    │  Restaurantes de       │    │
│    │  Holambra              │    │
│    │  Dicas e sugestões...  │    │
│    │  ⏱ 12 horas           │    │
│    │  Abrir →               │    │
│    └────────────────────────┘    │
│                                  │
│    ┌────────────────────────┐    │
│    │  ...                   │    │
│    └────────────────────────┘    │
│                                  │
└──────────────────────────────────┘

Cards: full-width, stacked, 16px gap
```

---

### 6.8 Footer — Clean, Organized, Informative

Background: `#00251A`

```
padding: 64px 0 24px

┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│   ◇ Oranje                                                       │
│   GUIA CULTURAL                                                  │
│                                                                  │
│   Seu guia definitivo de Holambra.                               │
│   Descubra a cidade das flores.                                  │
│                                                                  │
│   ──────────────────────────────────────                         │
│                                                                  │
│   Navegação              Contato                                 │
│   Home                   contato@oranje.com.br                   │
│   O que fazer            (19) XXXX-XXXX                          │
│   Roteiros               Holambra, SP                            │
│   Blog                                                           │
│   Parceiros              Siga-nos                                │
│                          ⓘ Instagram                             │
│   Legal                                                          │
│   Política de Privacidade                                        │
│   Termos de Uso                                                  │
│                                                                  │
│   ──────────────────────────────────────                         │
│                                                                  │
│   © 2026 Oranje. Todos os direitos reservados.                   │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘

Desktop: 3-column grid for links section
Mobile: single column, stacked

Text:     #FFFFFF
Links:    rgba(255,255,255,0.7), hover → #FFFFFF
Accents:  #E65100 for hover underlines
Divider:  1px solid rgba(255,255,255,0.1)
```

#### Mobile Footer
```
┌──────────────────────────────────┐
│                                  │
│   ◇ Oranje                      │
│   GUIA CULTURAL                 │
│                                  │
│   Seu guia definitivo           │
│   de Holambra.                  │
│                                  │
│   ────────────────────          │
│                                  │
│   Navegação                     │
│   Home                          │
│   O que fazer                   │
│   Roteiros                      │
│   Blog                          │
│   Parceiros                     │
│                                  │
│   ────────────────────          │
│                                  │
│   Contato                       │
│   contato@oranje.com.br         │
│   (19) XXXX-XXXX                │
│                                  │
│   ────────────────────          │
│                                  │
│   ⓘ Instagram                  │
│                                  │
│   ────────────────────          │
│                                  │
│   © 2026 Oranje.                │
│                                  │
└──────────────────────────────────┘

Padding: 48px 20px 20px
```

---

## 7. Section Flow & Background Pattern

The page alternates backgrounds for visual rhythm:

```
┌──────────────────────┐
│  Header              │  #00251A (dark green, solid)
├──────────────────────┤
│  Hero                │  Full-width image + gradient
├──────────────────────┤
│  Stats strip         │  #00251A (optional, thin)
├──────────────────────┤
│  Categories          │  #FFFFFF (white)
├──────────────────────┤
│  Featured Places     │  #F5F5DC (beige)
├──────────────────────┤
│  Roteiros            │  #FFFFFF (white)
├──────────────────────┤
│  Map                 │  #F5F5DC (beige)
├──────────────────────┤
│  Events              │  #FFFFFF (white)
├──────────────────────┤
│  Footer              │  #00251A (dark green)
└──────────────────────┘
```

---

## 8. Personality & Premium Touches

These small details make the difference between "template" and "travel brand":

### 8.1 Section Labels
Every content section starts with a tiny colored label above the title:
```
DESTAQUES     ← 0.75rem, uppercase, #E65100, font-weight 600, letter-spacing 0.08em
Destaques da Semana    ← main title
Descrição aqui         ← subtitle
```
This creates a clear visual hierarchy and adds editorial flair.

### 8.2 Custom Icon Set
Use Lucide icons consistently, but always inside a **beige circle container**:
```
┌────────┐
│  ┌──┐  │   56px container, bg: #F5F5DC, border-radius: 14px
│  │🍽│  │   24px icon, color: #00251A
│  └──┘  │
└────────┘
```

### 8.3 Hover Micro-interactions
```css
/* Cards */
transition: transform 0.3s ease, box-shadow 0.3s ease;
hover: translateY(-2px), deeper shadow

/* Links */  
transition: color 0.2s ease;
hover: color → #E65100 or underline

/* Buttons */
transition: background 0.2s ease, transform 0.15s ease;
hover: darker bg, translateY(-1px)
active: translateY(0)
```

### 8.4 Scroll Reveal Animation
Sections fade in gently as you scroll. **Subtle, not flashy.**

```css
.reveal {
  opacity: 0;
  transform: translateY(20px);   /* only 20px — not 40 */
  transition: opacity 0.6s ease, transform 0.6s ease;
}
.reveal.visible {
  opacity: 1;
  transform: translateY(0);
}
```
Trigger at 15% visibility using IntersectionObserver.

### 8.5 Warm, Inviting Copy
Instead of generic text, use copy that feels personal:

| Generic ❌ | Premium ✅ |
|-----------|----------|
| "Categorias" | "Explore por Categoria" |
| "Ver todos" | "Explorar →" |
| "Locais" | "Destaques da Semana" |
| "Mapa" | "Explore Holambra no mapa" |
| "Eventos" | "Não perca o que está acontecendo" |

### 8.6 The → Arrow
CTAs always end with ` →` (thin arrow). It suggests movement and discovery:
```
Abrir o App →
Ver Roteiros →
Explorar →
Abrir Mapa →
```

---

## 9. Responsive Breakpoints

```
Mobile:     < 640px    — 1 column, stacked, generous padding
Tablet:     640–1023px — 2 columns where applicable
Desktop:    ≥ 1024px   — 3+ columns, max-width 1200px centered
```

Key rules:
- **Mobile**: No horizontal scrolling except Featured Places cards
- **Mobile**: All buttons full-width in hero, auto-width elsewhere
- **Mobile**: Section padding 64px vertical, 20px horizontal
- **Desktop**: Section padding 96px vertical, 40px horizontal
- **All sizes**: Text never touches screen edges (min 20px padding)

---

## 10. What We're NOT Doing

To keep the design premium and focused:

| Removed | Why |
|---------|-----|
| Glassmorphism header | Looks trendy but adds visual noise. Solid is more confident. |
| Skeleton loading screens | Overcomplicates initial build. Clean static UI first. |
| Large map placeholder | Wastes space. Simple text + CTA is cleaner. |
| Rigid 8px grid enforcement | Natural spacing feels better. Use the scale above. |
| Complex animations | Only scroll-reveal (fade+translateY). Nothing bouncing or spinning. |
| Multiple button styles | Only 3: primary (orange), secondary (outline), dark (green). |
| Gradient buttons | Flat, solid colors only. |

---

## 11. Implementation Notes

### Files to Modify
```
client/src/styles/tokens.css        → Update shadow, spacing, typography tokens
client/src/index.css                → Update .site-card, .site-cta, remove skeleton
client/src/components/SiteHeader.tsx → Remove glassmorphism, solid bg
client/src/components/SiteFooter.tsx → Minor spacing adjustments
client/src/pages/SiteHome.tsx        → Implement all section changes
client/src/components/SiteLayout.tsx → No changes expected
```

### CSS Token Updates Needed
```css
/* Remove from tokens.css */
--site-glass-bg         /* DELETE */
--site-glass-border     /* DELETE */

/* Update in tokens.css */
--site-shadow-sm: 0 1px 3px rgba(0, 37, 26, 0.06);
--site-shadow-md: 0 8px 24px rgba(0, 37, 26, 0.10);
--site-shadow-lg: /* REMOVE — we only need two levels */

/* Add to tokens.css */
--site-text-muted: #4A6B5D;
--site-beige-hover: #EDE9D0;
--site-border-subtle: rgba(0, 37, 26, 0.08);
```

### Priority Order
1. Header (remove glassmorphism) — quick win
2. Hero section (search bar, buttons, spacing)
3. Featured Places (premium cards, 3:2 ratio)
4. Categories (icon containers, spacing)
5. Roteiros (beige cards on white)
6. Map (simplify to text + CTA)
7. Events (editorial cards)
8. Footer (spacing tweaks)

---

> **This document is the visual contract.** Every measurement, color, and interaction is specified.
> Implementation should match these specs exactly. When in doubt, choose the simpler option.
