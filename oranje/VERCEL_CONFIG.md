# Configuração de Deploy no Vercel - Oranje Frontend

## Visão Geral

Este projeto é **full-stack** (client + server), mas no Vercel fazemos deploy **apenas do frontend** (React/Vite). O backend deve rodar separadamente (ex: Railway).

### Estrutura relevante

```
oranje_project/
├── client/          ← Código-fonte do frontend (React/Vite)
├── server/          ← Backend (NÃO deployar no Vercel)
├── vite.config.ts   ← Config do Vite (root: client/, outDir: dist/public)
├── vercel.json      ← Config de deploy do Vercel
├── package.json     ← Scripts de build
└── dist/
    ├── public/      ← Build do frontend (OUTPUT do Vercel)
    └── index.js     ← Build do server (ignorar no Vercel)
```

---

## Configurações no Vercel Dashboard

### Opção 1: Usando `vercel.json` (Recomendado ✅)

O arquivo `vercel.json` na raiz já contém toda a configuração necessária. Basta importar o repositório no Vercel com as seguintes configurações:

| Campo              | Valor                          |
|--------------------|--------------------------------|
| **Framework Preset** | Vite                         |
| **Root Directory** | `.` (raiz — deixar padrão)     |
| **Build Command**  | *(Override)* `npx vite build`  |
| **Output Directory** | *(Override)* `dist/public`   |

> ⚠️ O Vercel deve usar o `vercel.json` automaticamente, mas caso não detecte, configure manualmente no dashboard.

### Opção 2: Configuração Manual no Dashboard

Se preferir não usar `vercel.json`, configure diretamente:

1. **Framework Preset**: `Vite`
2. **Root Directory**: `.` (raiz do repositório)
3. **Build Command**: `npx vite build`
4. **Output Directory**: `dist/public`
5. **Install Command**: `npm install` ou `pnpm install`

---

## Variáveis de Ambiente

Configure estas variáveis no Vercel Dashboard → Settings → Environment Variables:

| Variável                      | Obrigatória | Descrição                            |
|-------------------------------|-------------|--------------------------------------|
| `VITE_GA4_MEASUREMENT_ID`    | Opcional    | ID do Google Analytics 4 (G-XXXXX)  |

> 💡 Variáveis com prefixo `VITE_` são expostas ao frontend no build. NÃO coloque secrets do backend aqui.

---

## SPA Rewrites (BrowserRouter)

O projeto usa **BrowserRouter** do React Router, então todas as rotas precisam ser redirecionadas para `index.html`. Isso já está configurado no `vercel.json`:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### Rotas suportadas:
- `/` — Homepage
- `/sobre` — About
- `/landing` — Landing page
- `/blog`, `/blog/:slug` — Blog
- `/categorias` — Categorias
- `/o-que-fazer-em-holambra` — O que fazer
- `/roteiros`, `/mapa`, `/parceiros`, `/contato` — Páginas secundárias
- `/app/*` — Área do app (login, busca, favoritos, etc.)
- `/melhores-*`, `/roteiro-*` — Páginas SEO

---

## Troubleshooting

### ❌ Vercel mostra código do backend / página em branco
**Causa**: `outputDirectory` apontando para `dist` em vez de `dist/public`.  
**Solução**: Verifique se `outputDirectory` está como `dist/public` no `vercel.json` ou dashboard.

### ❌ Build falha com erro de dependências
**Causa**: O Vercel pode não instalar devDependencies por padrão.  
**Solução**: Verifique se `NODE_ENV` não está definido como `production` durante o install, ou configure Install Command como `npm install --include=dev`.

### ❌ Rotas retornam 404 ao acessar diretamente
**Causa**: Falta de rewrite para SPA.  
**Solução**: Verifique se `vercel.json` contém a regra de rewrites para `index.html`.

### ❌ Assets não carregam (CSS, JS)
**Causa**: Path incorreto ou cache headers ausentes.  
**Solução**: Os assets Vite ficam em `/assets/` com hashes no nome. O `vercel.json` já configura cache immutable para eles.

### ❌ PWA/Service Worker não funciona
**Causa**: `sw.js` deve ser servido sem cache.  
**Solução**: O `vercel.json` já inclui header `Cache-Control: no-cache` para `/sw.js`.

---

## Scripts Disponíveis

| Script            | Comando                        | Descrição                              |
|-------------------|--------------------------------|----------------------------------------|
| `build`           | `npm run build`                | Build full-stack (frontend + backend)  |
| `build:client`    | `npm run build:client`         | Build apenas do frontend (Vite)        |
| `dev`             | `npm run dev`                  | Dev server full-stack                  |

---

## Notas Importantes

1. **O backend NÃO roda no Vercel** — ele está configurado para Railway (ver `DEPLOY_RAILWAY.md`)
2. **O Vite config está na raiz** (`vite.config.ts`) com `root: client/` — por isso o Root Directory no Vercel é `.` e não `client/`
3. **O build do frontend vai para `dist/public/`** — esse é o output directory correto
4. **Não confundir `dist/` com `dist/public/`** — `dist/` contém também o bundle do servidor (`index.js`)
