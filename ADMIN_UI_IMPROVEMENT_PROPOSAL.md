# 🎨 Admin Panel UI Improvement Proposal

> **Status:** Proposta para aprovação — NENHUMA implementação ainda  
> **Escopo:** Dois painéis admin existentes  
> **Filosofia:** Clean. Minimal. Consistente com o Design System do site público.

---

## 📋 Índice

1. [Análise da Estrutura Atual](#1-análise-da-estrutura-atual)
2. [Problemas Identificados](#2-problemas-identificados)
3. [Design System Aplicado](#3-design-system-aplicado)
4. [Proposta: App Admin (`/app/admin`)](#4-proposta-app-admin-appadmin)
5. [Proposta: CMS Admin (`/admin`)](#5-proposta-cms-admin-admin)
6. [Componentes Compartilhados](#6-componentes-compartilhados)
7. [Layout Mobile](#7-layout-mobile)
8. [O que será Preservado vs Melhorado](#8-o-que-será-preservado-vs-melhorado)
9. [Tipografia e Hierarquia](#9-tipografia-e-hierarquia)

---

## 1. Análise da Estrutura Atual

### App Admin (`/app/admin`) — Admin.tsx
```
Rota:        /app/admin
Auth:        useAuth() hook + role check
Tabs:        11 abas (dashboard, places, events, vouchers, ads, partners, 
             drivers, routes, categories, articles, logs)
Layout:      Header fixo + tabs horizontais scrolláveis + conteúdo
Estilo:      Dark theme (oranje-app) com gold (#D88A3D)
Componentes: AdminListTable, AdminFormModal, AdminPlaces, AdminEvents, 
             AdminVouchers, AdminAds, AdminPartners, AdminRoutes, 
             AdminCategories, AdminArticles, DriversAdminTab
```

**Estrutura visual atual:**
```
┌─────────────────────────────────────────┐
│ [←] 🏠 ADMIN  user@email     [logout]  │  ← Header dark, gold text
├─────────────────────────────────────────┤
│ [Dashboard][Lugares][Eventos][Vouchers] │  ← Tabs scrolláveis, 
│ [Anúncios][Parceiros][Motoristas]...    │     gold active state
├─────────────────────────────────────────┤
│                                         │
│  Conteúdo da tab ativa                  │  ← glass-card components
│  (AdminListTable / Dashboard cards)     │     dark background
│                                         │
└─────────────────────────────────────────┘
```

### CMS Admin (`/admin`) — CMSDashboard.tsx
```
Rota:        /admin (login em /admin/login)
Auth:        fetch /api/cms/login (sessão cookie)
Tabs:        4 abas (Conteúdo, Páginas, Blog, SEO)
Layout:      Header branco + tabs dentro de card + conteúdo
Estilo:      Light theme (bg-gray-100) com shadcn/ui components
Componentes: CMSEditor, CMSPages, CMSBlog, CMSSEO
```

**Estrutura visual atual:**
```
┌─────────────────────────────────────────┐
│ [logo] CMS Oranje               [Sair] │  ← Header branco, border
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ [Conteúdo][Páginas][Blog][SEO]  │    │  ← Tabs dentro de card
│  ├─────────────────────────────────┤    │     branco com border
│  │                                 │    │
│  │  Conteúdo da tab ativa          │    │  ← shadcn Cards, Inputs
│  │  (Forms, listas de cards)       │    │
│  │                                 │    │
│  └─────────────────────────────────┘    │
│                                         │
└─────────────────────────────────────────┘
```

---

## 2. Problemas Identificados

### Visual / Consistência
| Problema | App Admin | CMS Admin |
|----------|-----------|-----------|
| Cores inconsistentes com o site | Gold (#D88A3D) no dark theme | Genérico gray-100 |
| Sem identidade Oranje unificada | ✗ | ✗ |
| Tipografia diferente do site | Padrão do oranje-app | Padrão shadcn |
| Sem Montserrat | ✗ | ✗ |

### Navegação
| Problema | App Admin | CMS Admin |
|----------|-----------|-----------|
| 11 tabs numa linha scrollável | Difícil encontrar tabs | — |
| Sem agrupamento lógico | Tudo numa lista linear | Ok (4 tabs) |
| Sem indicação de "onde estou" | Só tab ativa muda cor | Só border-bottom |

### Mobile
| Problema | App Admin | CMS Admin |
|----------|-----------|-----------|
| Tabs scrolláveis demais | Precisa scroll horizontal | — |
| Tabelas cortam no mobile | overflow-x-auto básico | — |
| Forms modal muito apertado | max-w-md fixo | Não usa modal |

---

## 3. Design System Aplicado

### Cores
```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  BACKGROUNDS                                            │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐           │
│  │           │  │           │  │           │           │
│  │  #FFFFFF  │  │  #F5F5DC  │  │  #00251A  │           │
│  │  Branco   │  │  Beige    │  │  Dark     │           │
│  │  (fundo   │  │  (sidebar │  │  Green    │           │
│  │  principal│  │  e cards  │  │  (header) │           │
│  │  )        │  │  alternado│  │           │           │
│  └───────────┘  └───────────┘  └───────────┘           │
│                                                         │
│  ACCENTS                                                │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐           │
│  │           │  │           │  │           │           │
│  │  #E65100  │  │  #00251A  │  │  #6B7280  │           │
│  │  Orange   │  │  Dark     │  │  Gray     │           │
│  │  (CTAs,   │  │  Green    │  │  (texto   │           │
│  │  botões)  │  │  (texto   │  │  secund.) │           │
│  │           │  │  principal│  │           │           │
│  └───────────┘  └───────────┘  └───────────┘           │
│                                                         │
│  STATUS                                                 │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐           │
│  │  #16A34A  │  │  #EAB308  │  │  #DC2626  │           │
│  │  Verde    │  │  Amarelo  │  │  Vermelho │           │
│  │  (ativo)  │  │  (rascunho│  │  (erro/   │           │
│  │           │  │  )        │  │  deletar) │           │
│  └───────────┘  └───────────┘  └───────────┘           │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Tipografia (Montserrat)
```
Título de página:     24px / 700 (bold)   / #00251A
Título de seção:      18px / 600 (semi)   / #00251A
Subtítulo:            14px / 400 (regular) / #6B7280
Corpo de texto:       14px / 400           / #374151
Label de formulário:  13px / 500 (medium)  / #374151
Placeholder:          13px / 400           / #9CA3AF
Dados de tabela:      13px / 400           / #374151
Cabeçalho de tabela:  12px / 600           / #6B7280 (uppercase)
Badge/Tag:            11px / 600           / cor do status
```

---

## 4. Proposta: App Admin (`/app/admin`)

### Layout Desktop (≥1024px)

A mudança principal: **substituir tabs scrolláveis por sidebar fixa**.

```
┌──────────────────────────────────────────────────────────────────┐
│  ┌──────┐                                                       │
│  │ logo │  Oranje Admin          user@email.com    [Sair →]     │
│  └──────┘                                                       │
│  bg: #00251A   text: #FFFFFF                                    │
├────────────────┬─────────────────────────────────────────────────┤
│                │                                                 │
│   SIDEBAR      │   CONTEÚDO                                     │
│   bg: #FFFFFF  │   bg: #F8F8F4                                  │
│   w: 240px     │                                                 │
│                │   ┌─ Breadcrumb ──────────────────────────┐     │
│   ┌──────────┐ │   │  Admin > Lugares                      │     │
│   │📊        │ │   └───────────────────────────────────────┘     │
│   │Dashboard │ │                                                 │
│   └──────────┘ │   ┌─ Page Header ─────────────────────────┐     │
│                │   │  Lugares                    [+ Novo]   │     │
│   GESTÃO       │   │  Gerencie os lugares cadastrados       │     │
│   ┌──────────┐ │   └───────────────────────────────────────┘     │
│   │🏢        │ │                                                 │
│   │Lugares ← │ │   ┌─ Search Bar ──────────────────────────┐     │
│   ├──────────┤ │   │  🔍 Buscar lugares...                  │     │
│   │📅        │ │   └───────────────────────────────────────┘     │
│   │Eventos   │ │                                                 │
│   ├──────────┤ │   ┌─ Table Card ──────────────────────────┐     │
│   │🎫        │ │   │                                        │     │
│   │Vouchers  │ │   │  NOME          ENDEREÇO      STATUS    │     │
│   ├──────────┤ │   │  ─────────────────────────────────────  │     │
│   │📦        │ │   │  Café Moinho   Rua das...   ● Ativo    │     │
│   │Anúncios  │ │   │  Restaurante   Av. Hol...   ● Ativo    │     │
│   ├──────────┤ │   │  Pousada Sol   Rua Líri...  ○ Inativo  │     │
│   │🏷️        │ │   │                                        │     │
│   │Parceiros │ │   │            [✏️] [🗑️]  ← ações          │     │
│   ├──────────┤ │   │                                        │     │
│   │🚗        │ │   └───────────────────────────────────────┘     │
│   │Motoristas│ │                                                 │
│   └──────────┘ │                                                 │
│                │                                                 │
│   CONTEÚDO     │                                                 │
│   ┌──────────┐ │                                                 │
│   │🗺️        │ │                                                 │
│   │Roteiros  │ │                                                 │
│   ├──────────┤ │                                                 │
│   │🏷️        │ │                                                 │
│   │Categorias│ │                                                 │
│   ├──────────┤ │                                                 │
│   │📝        │ │                                                 │
│   │Artigos   │ │                                                 │
│   └──────────┘ │                                                 │
│                │                                                 │
│   SISTEMA      │                                                 │
│   ┌──────────┐ │                                                 │
│   │📋        │ │                                                 │
│   │Logs      │ │                                                 │
│   └──────────┘ │                                                 │
│                │                                                 │
├────────────────┴─────────────────────────────────────────────────┤
```

### Sidebar — Agrupamento Lógico
```
GESTÃO (label de grupo)
├── 📊 Dashboard
├── 🏢 Lugares
├── 📅 Eventos
├── 🎫 Vouchers
├── 📦 Anúncios
├── 🏷️ Parceiros
└── 🚗 Motoristas

CONTEÚDO (label de grupo)
├── 🗺️ Roteiros
├── 🏷️ Categorias
└── 📝 Artigos

SISTEMA (label de grupo)
└── 📋 Logs
```

### Sidebar Item States
```
┌─────────────────────────┐
│                         │
│  Normal:                │
│  ┌───────────────────┐  │
│  │ 🏢 Lugares        │  │  text: #374151
│  └───────────────────┘  │  bg: transparent
│                         │
│  Hover:                 │
│  ┌───────────────────┐  │
│  │ 🏢 Lugares        │  │  text: #00251A
│  └───────────────────┘  │  bg: #F5F5DC (beige)
│                         │
│  Active:                │
│  ┌───────────────────┐  │
│  │ 🏢 Lugares      → │  │  text: #E65100 (orange)
│  └───────────────────┘  │  bg: rgba(230,81,0,0.06)
│                         │  border-left: 3px solid #E65100
│  Group Label:           │
│    GESTÃO               │  text: 11px / 600 / #9CA3AF
│                         │  uppercase, letter-spacing
│                         │
└─────────────────────────┘
```

### Dashboard Cards — Novo Estilo
```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌────│
│  │             │  │             │  │             │  │    │
│  │   🏢 128   │  │   📅  42   │  │   🏷️  35   │  │  👤│
│  │  Lugares    │  │  Eventos    │  │  Parceiros  │  │  Us│
│  │             │  │             │  │             │  │    │
│  └─────────────┘  └─────────────┘  └─────────────┘  └────│
│                                                             │
│  bg: #FFFFFF                                                │
│  border: 1px solid #E5E7EB                                  │
│  border-radius: 12px                                        │
│  shadow: 0 1px 3px rgba(0,0,0,0.05)                        │
│  number: 32px / 700 / #00251A                               │
│  label: 13px / 400 / #6B7280                                │
│  icon: cada um com cor própria (subtle bg)                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Table (AdminListTable) — Novo Estilo
```
┌────────────────────────────────────────────────────────────┐
│  bg: #FFFFFF                                               │
│  border: 1px solid #E5E7EB                                 │
│  border-radius: 12px                                       │
│  overflow: hidden                                          │
│                                                            │
│  ┌────────────────────────────────────────────────────┐    │
│  │  NOME          ENDEREÇO          STATUS    AÇÕES   │    │
│  │  ─────────────────────────────────────────────────  │    │
│  │                                                     │    │
│  │  Café Moinho   Rua das Flores    ● Ativo   [✏️][🗑️] │    │
│  │  ·············································      │    │
│  │  Restaurante   Av. Holambra 42   ● Ativo   [✏️][🗑️] │    │
│  │  ·············································      │    │
│  │  Pousada Sol   Rua Lírios 10     ○ Inativo [✏️][🗑️] │    │
│  │                                                     │    │
│  └────────────────────────────────────────────────────┘    │
│                                                            │
│  Header:   bg: #F9FAFB, text: 12px/600/#6B7280 uppercase  │
│  Rows:     border-bottom: 1px solid #F3F4F6               │
│  Row hover: bg: #FAFAF5 (very subtle beige)               │
│  Edit btn: bg: rgba(0,37,26,0.06), icon: #00251A          │
│  Delete btn: bg: rgba(220,38,38,0.06), icon: #DC2626      │
│  Status badges:                                            │
│    Ativo  → bg: #DCFCE7, text: #16A34A, dot: ●            │
│    Inativo → bg: #F3F4F6, text: #6B7280, dot: ○           │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

### Form Modal (AdminFormModal) — Novo Estilo
```
┌─────────────────────────────────────────┐
│                                         │
│   backdrop: rgba(0,37,26,0.4)           │
│   blur: 4px                             │
│                                         │
│   ┌─────────────────────────────────┐   │
│   │                                 │   │
│   │  Criar Lugar            [✕]    │   │  bg: #FFFFFF
│   │  ───────────────────────────    │   │  border-radius: 16px
│   │                                 │   │  shadow: 0 25px 50px
│   │  Nome *                         │   │         rgba(0,0,0,0.12)
│   │  ┌───────────────────────────┐  │   │
│   │  │ Nome do lugar             │  │   │  inputs:
│   │  └───────────────────────────┘  │   │    bg: #FFFFFF
│   │                                 │   │    border: 1px solid #D1D5DB
│   │  Descrição                      │   │    border-radius: 8px
│   │  ┌───────────────────────────┐  │   │    focus: border #E65100
│   │  │                           │  │   │           ring: orange/20
│   │  │                           │  │   │
│   │  └───────────────────────────┘  │   │  labels:
│   │                                 │   │    13px / 500 / #374151
│   │  Status                         │   │
│   │  ┌───────────────────────────┐  │   │  required *:
│   │  │ Ativo               ▼    │  │   │    color: #DC2626
│   │  └───────────────────────────┘  │   │
│   │                                 │   │
│   │  ┌─────────┐  ┌─────────────┐  │   │
│   │  │Cancelar │  │   Salvar    │  │   │  Cancelar: outlined
│   │  │         │  │             │  │   │  Salvar: bg #E65100
│   │  └─────────┘  └─────────────┘  │   │         text: #FFFFFF
│   │                                 │   │
│   └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

---

## 5. Proposta: CMS Admin (`/admin`)

### Layout Desktop (≥1024px)

O CMS usa o **mesmo design system**, mas com layout mais simples (4 tabs apenas).

```
┌──────────────────────────────────────────────────────────────────┐
│  ┌──────┐                                                       │
│  │ logo │  CMS Oranje            admin@oranje.com   [Sair →]    │
│  └──────┘                                                       │
│  bg: #00251A   text: #FFFFFF                                    │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│   max-width: 1200px   margin: auto   padding: 32px              │
│                                                                  │
│   ┌──────────────────────────────────────────────────────────┐   │
│   │  [📄 Conteúdo] [📖 Páginas] [🌐 Blog] [⚙️ SEO]         │   │
│   │                                                          │   │
│   │  ← Tabs com border-bottom                               │   │
│   │  Active: text #E65100, border-bottom 2px solid #E65100   │   │
│   │  Normal: text #6B7280                                    │   │
│   └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│   ┌──────────────────────────────────────────────────────────┐   │
│   │                                                          │   │
│   │  Gerenciar Blog                          [+ Novo Artigo] │   │
│   │  Crie, edite e publique artigos do blog                  │   │
│   │                                                          │   │
│   │  ┌──────────────────────────────────────────────────┐    │   │
│   │  │                                                  │    │   │
│   │  │  Os 10 Melhores Restaurantes de Holambra         │    │   │
│   │  │  /melhores-restaurantes-holambra                  │    │   │
│   │  │  [Turismo] [● Publicado]         [Editar][Deletar]│    │   │
│   │  │                                                  │    │   │
│   │  ├──────────────────────────────────────────────────┤    │   │
│   │  │                                                  │    │   │
│   │  │  Guia Completo: O Que Fazer em Holambra          │    │   │
│   │  │  /guia-holambra                                   │    │   │
│   │  │  [Cultura] [○ Rascunho]          [Editar][Deletar]│    │   │
│   │  │                                                  │    │   │
│   │  └──────────────────────────────────────────────────┘    │   │
│   │                                                          │   │
│   └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│   bg: #F8F8F4 (page)                                             │
│   cards: bg #FFFFFF, border: 1px solid #E5E7EB, radius: 12px    │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### CMS Login — Novo Estilo
```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│   bg: #F5F5DC (beige, full page)                                 │
│                                                                  │
│                  ┌───────────────────────┐                       │
│                  │                       │                       │
│                  │      🏠 Oranje        │   bg: #FFFFFF         │
│                  │      CMS Admin        │   border-radius: 16px │
│                  │   Painel administrativo│   shadow: subtle      │
│                  │                       │                       │
│                  │   Email               │                       │
│                  │   ┌─────────────────┐ │                       │
│                  │   │                 │ │   input focus:         │
│                  │   └─────────────────┘ │   border: #E65100     │
│                  │                       │                       │
│                  │   Senha               │                       │
│                  │   ┌─────────────────┐ │                       │
│                  │   │ ••••••••        │ │                       │
│                  │   └─────────────────┘ │                       │
│                  │                       │                       │
│                  │   ┌─────────────────┐ │                       │
│                  │   │     Entrar      │ │   bg: #E65100         │
│                  │   └─────────────────┘ │   text: #FFFFFF       │
│                  │                       │   border-radius: 8px  │
│                  │   Acesso restrito a   │                       │
│                  │   administradores     │                       │
│                  │                       │                       │
│                  └───────────────────────┘                       │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### CMS Form (Edição de conteúdo) — Mesmo design system
```
┌──────────────────────────────────────────────────────┐
│  bg: #FFFFFF   border: 1px solid #E5E7EB             │
│  border-radius: 12px   padding: 24px                 │
│                                                      │
│  Editar Hero                                         │
│  Configure a seção principal da landing page         │
│  ─────────────────────────────────────               │
│                                                      │
│  Título                                              │
│  ┌──────────────────────────────────────────────┐    │
│  │ Descubra Holambra                             │    │
│  └──────────────────────────────────────────────┘    │
│                                                      │
│  Subtítulo                                           │
│  ┌──────────────────────────────────────────────┐    │
│  │ A cidade das flores espera por você           │    │
│  │                                               │    │
│  └──────────────────────────────────────────────┘    │
│                                                      │
│  Imagem do Hero                                      │
│  ┌──────────────────────────────────────────────┐    │
│  │  📸 Arraste ou clique para enviar            │    │
│  │     PNG, JPG até 5MB                          │    │
│  └──────────────────────────────────────────────┘    │
│                                                      │
│  ┌──────────────────┐                                │
│  │   Salvar Hero    │  bg: #E65100, text: #FFF       │
│  └──────────────────┘  border-radius: 8px            │
│                                                      │
│  inputs: bg #FFFFFF, border: 1px solid #D1D5DB       │
│  focus: border #E65100, box-shadow: 0 0 0 3px        │
│         rgba(230,81,0,0.1)                            │
│  labels: 13px / 500 / #374151                        │
│  descriptions: 13px / 400 / #9CA3AF                  │
│                                                      │
└──────────────────────────────────────────────────────┘
```

---

## 6. Componentes Compartilhados

### O que AMBOS os painéis usarão (mesmos tokens):

```
COMPONENTE             USADO EM              O QUE MUDA
─────────────────────────────────────────────────────────
AdminHeader            App Admin + CMS        → Novo componente unificado
                                                bg: #00251A, Montserrat

AdminListTable         App Admin              → Reestilizar para light theme
                                                bg branco, borders sutis

AdminFormModal         App Admin              → Reestilizar para light theme
                                                bg branco, inputs limpos

shadcn Button/Input    CMS Admin              → Manter, ajustar cores
                                                primary: #E65100

Sidebar (NOVO)         App Admin              → Novo componente
                                                Agrupamento lógico

Badges de Status       Ambos                  → Unificar estilo
                                                Verde/Amarelo/Vermelho
```

### Tokens CSS compartilhados
```css
/* Tokens que serão reutilizados de tokens.css */
--admin-bg:           #F8F8F4;       /* Fundo da página */
--admin-card-bg:      #FFFFFF;       /* Fundo dos cards */
--admin-border:       #E5E7EB;       /* Bordas */
--admin-border-hover: #D1D5DB;       /* Bordas hover */
--admin-text:         #374151;       /* Texto principal */
--admin-text-muted:   #6B7280;       /* Texto secundário */
--admin-text-heading: #00251A;       /* Títulos */
--admin-accent:       #E65100;       /* Ações, CTAs */
--admin-accent-hover: #D84800;       /* Hover de ações */
--admin-success:      #16A34A;       /* Status ativo */
--admin-warning:      #EAB308;       /* Status rascunho */
--admin-danger:       #DC2626;       /* Deletar/erro */
--admin-radius:       12px;          /* Border radius padrão */
--admin-radius-sm:    8px;           /* Radius menor */
--admin-shadow:       0 1px 3px rgba(0,0,0,0.05);
--admin-shadow-lg:    0 4px 12px rgba(0,0,0,0.08);
--admin-font:         'Montserrat', sans-serif;
```

---

## 7. Layout Mobile

### App Admin — Mobile (<768px)

A sidebar vira **bottom sheet** ou **hamburger menu**.

```
┌───────────────────────────────┐
│ 🏠 Oranje Admin    [☰] [🚪] │  ← Header fixo, 56px
├───────────────────────────────┤
│                               │
│  Admin > Lugares              │  ← Breadcrumb
│                               │
│  Lugares           [+ Novo]   │  ← Title + CTA
│                               │
│  🔍 Buscar...                 │  ← Search full-width
│                               │
│  ┌───────────────────────────┐│
│  │ Café Moinho               ││  ← Card-based layout
│  │ Rua das Flores, 123       ││    (não tabela)
│  │ ● Ativo      [✏️] [🗑️]   ││
│  └───────────────────────────┘│
│                               │
│  ┌───────────────────────────┐│
│  │ Restaurante Holandês      ││
│  │ Av. Holambra, 42          ││
│  │ ● Ativo      [✏️] [🗑️]   ││
│  └───────────────────────────┘│
│                               │
└───────────────────────────────┘

Hamburger menu aberto (overlay):
┌───────────────────────────────┐
│ 🏠 Oranje Admin       [✕]    │
├───────────────────────────────┤
│                               │
│  GESTÃO                       │
│  ├── 📊 Dashboard             │
│  ├── 🏢 Lugares  ←           │
│  ├── 📅 Eventos               │
│  ├── 🎫 Vouchers              │
│  ├── 📦 Anúncios              │
│  ├── 🏷️ Parceiros             │
│  └── 🚗 Motoristas            │
│                               │
│  CONTEÚDO                     │
│  ├── 🗺️ Roteiros              │
│  ├── 🏷️ Categorias            │
│  └── 📝 Artigos               │
│                               │
│  SISTEMA                      │
│  └── 📋 Logs                  │
│                               │
│  ─────────────────────────    │
│  user@email.com               │
│  [Sair]                       │
│                               │
└───────────────────────────────┘
```

**Tabela → Cards no mobile:**
Em telas < 768px, `AdminListTable` renderiza como cards empilhados ao invés de tabela:

```
DESKTOP (tabela):
┌──────────────────────────────────────────────┐
│  NOME          ENDEREÇO        STATUS  AÇÕES │
│  Café Moinho   Rua Flores...  Ativo   [✏️🗑️]│
│  Restaurante   Av. Holamb...  Ativo   [✏️🗑️]│
└──────────────────────────────────────────────┘

MOBILE (cards):
┌─────────────────────────────┐
│  Café Moinho                │
│  Rua das Flores, 123        │
│  ● Ativo         [✏️] [🗑️]  │
└─────────────────────────────┘
┌─────────────────────────────┐
│  Restaurante Holandês       │
│  Av. Holambra, 42           │
│  ● Ativo         [✏️] [🗑️]  │
└─────────────────────────────┘
```

### CMS Admin — Mobile (<768px)
```
┌───────────────────────────────┐
│ 🏠 CMS Oranje         [Sair] │  ← Header fixo
├───────────────────────────────┤
│                               │
│ [Conteúdo][Páginas][Blog][SEO]│  ← Tabs scrolláveis
│                               │   (4 tabs cabe bem)
│  Gerenciar Blog   [+ Novo]   │
│                               │
│  ┌───────────────────────────┐│
│  │ Os 10 Melhores Rest...    ││
│  │ /melhores-restaurantes    ││
│  │ [Turismo] [● Publicado]   ││
│  │ [Editar] [Deletar]        ││
│  └───────────────────────────┘│
│                               │
│  ┌───────────────────────────┐│
│  │ Guia Completo: O Que...   ││
│  │ /guia-holambra            ││
│  │ [Cultura] [○ Rascunho]    ││
│  │ [Editar] [Deletar]        ││
│  └───────────────────────────┘│
│                               │
└───────────────────────────────┘
```

---

## 8. O que será Preservado vs Melhorado

### ✅ PRESERVADO (não muda)
```
├── Autenticação (useAuth, /api/cms/login)
├── Backend logic (tRPC routers, mutations)
├── Data structure (schemas, types)
├── Componentes funcionais (lógica CRUD)
│   ├── AdminPlaces (create/edit/delete logic)
│   ├── AdminEvents (create/edit/delete logic)
│   ├── AdminVouchers (create/edit/delete logic)
│   ├── AdminAds, AdminPartners, AdminRoutes...
│   ├── CMSEditor (content CRUD logic)
│   ├── CMSPages (pages CRUD logic)
│   ├── CMSBlog (articles CRUD logic)
│   └── CMSSEO (SEO config logic)
├── Rotas (/app/admin, /admin, /admin/login)
├── AdminGuard (auth wrapper)
├── ImageUpload component
├── Toast notifications (sonner)
└── All tRPC hooks and queries
```

### 🔄 MELHORADO (muda visual, mantém função)
```
├── Admin.tsx
│   ├── Header → Dark green (#00251A), Montserrat
│   ├── Tabs scrolláveis → Sidebar (desktop) / Hamburger (mobile)
│   ├── Dashboard cards → White cards com sombra sutil
│   └── Container → bg light (#F8F8F4)
│
├── AdminListTable.tsx
│   ├── glass-card → White card com border sutil
│   ├── Gold (#D88A3D) headers → Gray uppercase headers
│   ├── Dark rows → Light rows com hover beige
│   ├── Gold edit buttons → Green/red subtle buttons
│   └── Mobile: tabela → cards empilhados
│
├── AdminFormModal.tsx
│   ├── Dark bg (#0F1B14) → White bg (#FFFFFF)
│   ├── Gold borders → Gray borders, orange focus
│   ├── Dark inputs → Light inputs com border
│   └── Gold buttons → Orange primary, outlined secondary
│
├── CMSDashboard.tsx
│   ├── Gray header → Dark green header (#00251A)
│   ├── bg-gray-100 → bg #F8F8F4
│   └── Generic look → Oranje branded
│
├── CMSLogin.tsx
│   ├── Gradient dark bg → Beige bg (#F5F5DC)
│   └── Generic card → Clean, branded card
│
├── CMS Components (CMSPages, CMSBlog, CMSSEO, CMSEditor)
│   ├── Headers → Montserrat, #00251A headings
│   ├── Buttons → #E65100 primary (already close)
│   └── Cards → Consistent border/radius/shadow
```

### ❌ NÃO SERÁ FEITO
```
├── Não recria componentes — reutiliza tudo
├── Não muda rotas
├── Não altera schemas
├── Não modifica tRPC procedures
├── Não duplica lógica
├── Não overdesign (sem gradientes, sem animações complexas)
├── Não adiciona frameworks novos de UI
└── Não altera CMSEditor subtabs (Hero/Services/About/Contact)
```

---

## 9. Tipografia e Hierarquia

### Hierarquia visual aplicada
```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  HEADER BAR                                                 │
│  "Oranje Admin"   → 16px / 700 / #FFFFFF (sobre #00251A)   │
│  "user@email"     → 13px / 400 / rgba(255,255,255,0.6)     │
│                                                             │
│  SIDEBAR                                                    │
│  "GESTÃO"         → 11px / 600 / #9CA3AF / uppercase        │
│  "Lugares"        → 14px / 500 / #374151                    │
│  "Lugares" (ativo)→ 14px / 600 / #E65100                    │
│                                                             │
│  PAGE CONTENT                                               │
│  "Lugares"        → 24px / 700 / #00251A (título da página) │
│  "Gerencie os..." → 14px / 400 / #6B7280 (subtítulo)       │
│                                                             │
│  TABLE                                                      │
│  "NOME"           → 12px / 600 / #6B7280 / uppercase        │
│  "Café Moinho"    → 13px / 500 / #374151                    │
│  "● Ativo"        → 11px / 600 / #16A34A                    │
│                                                             │
│  FORM MODAL                                                 │
│  "Criar Lugar"    → 18px / 600 / #00251A                    │
│  "Nome *"         → 13px / 500 / #374151                    │
│  placeholder      → 13px / 400 / #9CA3AF                    │
│  "Salvar"         → 14px / 600 / #FFFFFF (sobre #E65100)    │
│  "Cancelar"       → 14px / 500 / #6B7280                    │
│                                                             │
│  BADGES                                                     │
│  ● Ativo          → 11px / 600 / #16A34A / bg #DCFCE7      │
│  ○ Inativo        → 11px / 600 / #6B7280 / bg #F3F4F6      │
│  ● Publicado      → 11px / 600 / #16A34A / bg #DCFCE7      │
│  ○ Rascunho       → 11px / 600 / #EAB308 / bg #FEF9C3      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Resumo das Mudanças

| Aspecto | Antes | Depois |
|---------|-------|--------|
| **Tema** | Dark (App Admin) + Light genérico (CMS) | Light unificado com design system Oranje |
| **Navegação App Admin** | 11 tabs scrolláveis | Sidebar com grupos + hamburger mobile |
| **Cor primária** | Gold #D88A3D | Orange #E65100 |
| **Headers** | Dark genérico / White genérico | Dark green #00251A ambos |
| **Tipografia** | Sem padrão | Montserrat em tudo |
| **Cards/Tabelas** | glass-card dark / gray cards | White cards, subtle borders |
| **Inputs** | Dark bg transparente / shadcn padrão | White, gray border, orange focus |
| **Mobile** | Tabs overflow / básico | Hamburger menu + cards responsivos |
| **Badges** | Sem padronização | Verde/Amarelo/Vermelho unificados |
| **Complexidade** | Moderada | Simples — sem overdesign |

---

> **Próximo passo:** Aprovação desta proposta antes de qualquer implementação.  
> Todas as mudanças são **puramente visuais** — zero impacto em backend, auth ou data.
