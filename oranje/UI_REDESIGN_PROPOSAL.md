# 🌷 ORANJE — UI Redesign Proposal v1.0

## Visão Geral

Transformação completa da interface pública do site ORANJE (páginas `Site*`) de um tema escuro dominante para um design premium, moderno e mobile-first com fundo branco, seções alternadas em bege e acentos de verde escuro + laranja.

---

## 🎨 Sistema de Cores

| Contexto | Cor | Hex | Uso |
|----------|-----|-----|-----|
| Fundo principal | Branco | `#FFFFFF` | Background principal de todas as seções ímpares |
| Fundo alternado | Bege | `#F5F5DC` | Background de seções pares (alternância) |
| Marca forte | Verde escuro | `#00251A` | Header, Footer, seções de destaque forte |
| Marca secundária | Verde médio | `#004D40` | Textos em fundo claro, ícones |
| CTA (ação) | Laranja | `#E65100` | Botões de ação, links de destaque |
| Texto principal | Verde escuro | `#00251A` | Títulos, corpo de texto em fundo claro |
| Texto invertido | Branco | `#FFFFFF` | Texto em fundo escuro (header/footer/hero) |

### Regras de Aplicação
- ✅ Branco como fundo principal
- ✅ Bege para alternar seções e criar ritmo visual
- ✅ Verde escuro APENAS para header, footer e seções "strong"
- ✅ Laranja APENAS para CTAs (botões, links de ação)
- ✅ Contraste mínimo 7:1 (WCAG AAA) em todos os textos

---

## 🔤 Tipografia — Montserrat

| Elemento | Mobile | Desktop | Peso | Line-height | Letter-spacing |
|----------|--------|---------|------|-------------|----------------|
| H1 (Hero) | 32px | 56px | 700 (Bold) | 1.2 | -0.02em |
| H2 (Seção) | 24px | 40px | 700 (Bold) | 1.2 | -0.02em |
| H3 (Card) | 20px | 28px | 700 (Bold) | 1.2 | 0 |
| Body | 16px | 18px | 400 (Regular) | 1.6 | 0 |
| Small | 14px | 16px | 400 (Regular) | 1.6 | 0 |

---

## 📐 Layout — Seção por Seção

### 1. HEADER (Sticky)
- **Background:** `#00251A` (verde escuro) sólido
- **Ao rolar:** glassmorphism `rgba(0,37,26,0.95)` + `backdrop-blur(12px)`
- **Esquerda:** Logo Oranje (branco)
- **Centro:** Links de navegação (branco, desktop only)
- **Direita:** Botão "Abrir o App" (laranja `#E65100`) + hamburger (mobile)
- **Altura:** 68px (default) → 60px (scrolled)
- **Sombra:** `0 4px 30px rgba(0,0,0,0.15)` quando scrolled

### 2. HERO
- **Imagem:** Full-width (moinho de vento de Holambra)
- **Overlay:** Gradiente `rgba(0,37,26,0.3)` → `rgba(0,37,26,0.6)`
- **Título:** "Descubra Holambra" — branco, grande, bold, centralizado
- **Subtítulo:** Descrição curta — branco, opacidade 0.9
- **Search bar:** Centralizado, glassmorphism `rgba(255,255,255,0.9)`, border-radius 12px
- **Stats:** 100+ Lugares | 50+ Parceiros | 30+ Roteiros
- **Indicador de scroll:** Seta animada sutil no bottom

### 3. CATEGORIAS (fundo branco `#FFFFFF`)
- **Grid:** 2 colunas (mobile) / 3-4 colunas (desktop)
- **Cards:** Fundo branco, sombra sutil, border-radius 12px
- **Ícones:** Lucide React, 24px, stroke-width 2px, cor verde escuro
- **Hover:** Elevação + `scale(1.02)` em 200ms
- **CTA:** Texto "Explorar →" em laranja

### 4. DESTAQUES (fundo bege `#F5F5DC`)
- **Layout:** Grid 1-3 colunas responsivo
- **Cards:**
  - Imagem (topo, aspect 4:3)
  - Gradiente overlay na imagem
  - Título (verde escuro `#00251A`)
  - Descrição curta
  - Rating com estrela
  - CTA: "Ver no app" botão laranja
- **Border-radius:** 12px
- **Sombra:** Level 1 → Level 2 no hover

### 5. ROTEIROS (fundo branco `#FFFFFF`)
- **Cards:** Título, descrição, duração com ícone de relógio
- **CTA:** Botão "Abrir" (laranja)
- **Mesmo estilo de card do Featured

### 6. MAPA (fundo bege `#F5F5DC`)
- **Layout:** 2 colunas (texto + mapa placeholder)
- **CTA:** "Abrir Mapa" botão laranja
- **Ícone de mapa grande**

### 7. EVENTOS & AGENDA (fundo branco `#FFFFFF`)
- **Lista limpa:** Títulos + datas
- **Minimal visual noise**
- **CTA:** "Ver Agenda Completa" em laranja

### 8. FOOTER (fundo verde escuro `#00251A`)
- **Texto:** Branco
- **Links:** Hover em laranja
- **Seções:** Navegação, Legal, Contato, Social
- **Copyright:** Opacidade 0.5

---

## ✨ Premium Features

### Elevation System
```css
Level 1: box-shadow: 0 2px 8px rgba(0,37,26,0.08)
Level 2: box-shadow: 0 8px 24px rgba(0,37,26,0.12)
Level 3: box-shadow: 0 12px 32px rgba(0,37,26,0.16)
```

### Micro-animations
- Card hover: elevação + `scale(1.02)` em 200ms
- CTA hover: `translateY(-1px)` sutil
- Scroll reveal: `fade-in + translateY(20px)` nos elementos
- Route transitions: 150ms fade

### Glassmorphism
- Header scrolled: `rgba(0,37,26,0.95)` + `backdrop-blur(12px)`
- Search bar: `rgba(255,255,255,0.9)` + `backdrop-blur(12px)`
- Mobile menu overlay

### Loading States
- Skeleton screens com shimmer animation
- Background: `#e5e5e0` → `#f5f5f0` shimmer

### Spacing System (múltiplos de 8px)
- xs: 8px | sm: 16px | md: 24px | lg: 32px | xl: 48px | 2xl: 64px | 3xl: 96px

### Acessibilidade (WCAG AAA)
- Focus states: outline laranja `#E65100`
- Touch targets: mínimo 44x44px
- Contraste 7:1+ em todos os textos
- Navegação por teclado completa

---

## 🔒 Restrições

- ❌ NÃO alterar rotas
- ❌ NÃO alterar lógica de backend/data fetching
- ❌ NÃO quebrar funcionalidade existente
- ✅ Foco APENAS em UI/estilo
- ✅ Manter estrutura de componentes e páginas

---

## 🛠 Implementação Técnica

### Abordagem
1. Adicionar classe `.site-light` no SiteLayout que sobrescreve as variáveis CSS do design system
2. Atualizar tokens.css com as variáveis do tema claro para site pages
3. Atualizar componentes DS para respeitar as novas variáveis
4. Redesenhar SiteHeader, SiteFooter, SiteHome
5. Adicionar animações e skeleton screens

### Arquivos modificados
- `client/src/styles/tokens.css` — Variáveis do tema claro
- `client/src/index.css` — Base styles + animations
- `client/src/components/SiteLayout.tsx` — Layout wrapper
- `client/src/components/SiteHeader.tsx` — Header redesign
- `client/src/components/SiteFooter.tsx` — Footer redesign
- `client/src/pages/SiteHome.tsx` — Homepage completa
- `client/src/components/ds/*.tsx` — Design system components

---

*Documento criado em 19/03/2026 — Oranje UI Redesign v1.0*
