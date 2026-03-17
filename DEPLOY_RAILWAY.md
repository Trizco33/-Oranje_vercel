# Guia de Deploy - ORANJE no Railway

## Estrutura do Projeto

```
oranje/
├── client/                 # Frontend React + Vite
├── server/                 # Backend Express + tRPC
├── drizzle/               # Database schema
├── dist/                  # Build output (gerado por pnpm build)
│   ├── index.js          # Servidor Express compilado
│   └── public/           # Frontend estático (Vite output)
├── package.json
└── pnpm-lock.yaml
```

## Pré-requisitos

- Node.js 18+ (Railway fornece automaticamente)
- pnpm (ou npm/yarn)
- Variáveis de ambiente configuradas

## Variáveis de Ambiente Necessárias

Configure no Railway:

```env
# Database
DATABASE_URL=mysql://user:password@host:port/database

# Authentication
JWT_SECRET=your-secret-key-here
VITE_APP_ID=your-app-id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://oauth.manus.im

# API Keys
BUILT_IN_FORGE_API_KEY=your-api-key
BUILT_IN_FORGE_API_URL=https://api.manus.im/forge
VITE_FRONTEND_FORGE_API_KEY=your-frontend-key
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im/forge

# Owner Info
OWNER_NAME=Your Name
OWNER_OPEN_ID=your-open-id

# Admin Key
ADMIN_KEY=your-admin-key

# Analytics (opcional)
VITE_ANALYTICS_ENDPOINT=https://analytics.example.com
VITE_ANALYTICS_WEBSITE_ID=your-website-id

# App Config
VITE_APP_TITLE=ORANJE — Guia Cultural de Holambra
VITE_APP_LOGO=https://your-cdn.com/logo.png
```

## Deploy no Railway

### Opção 1: Deploy via GitHub (Recomendado)

1. **Conectar repositório GitHub**
   - Acesse Railway.app
   - Clique em "New Project" → "Deploy from GitHub"
   - Selecione o repositório `oranje-holambra`
   - Autorize o Railway

2. **Configurar variáveis de ambiente**
   - Vá para "Variables"
   - Adicione todas as variáveis listadas acima

3. **Configurar build e start**
   - Build Command: `pnpm install && pnpm build`
   - Start Command: `pnpm start`

4. **Deploy automático**
   - Railway fará deploy automaticamente a cada push

### Opção 2: Deploy via CLI

```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login
railway login

# Criar projeto
railway init

# Configurar variáveis
railway variables set DATABASE_URL "mysql://..."
railway variables set JWT_SECRET "..."
# ... adicione todas as variáveis

# Deploy
railway up
```

## Estrutura de Build

### Build Process

```bash
pnpm build
```

Isso executa:
1. `vite build` - Compila frontend React para `dist/public/`
2. `esbuild server/_core/index.ts` - Compila backend para `dist/index.js`

### Output

- `dist/index.js` - Servidor Express pronto para produção
- `dist/public/` - Frontend estático (HTML, CSS, JS, assets)

## Servidor Express

O servidor está configurado para:

1. **Servir arquivos estáticos** de `dist/public/`
   - Todos os arquivos em `/assets/` são servidos com Content-Type correto
   - Suporta cache com `Cache-Control: public, max-age=86400`

2. **SPA Fallback**
   - Rotas não encontradas são redirecionadas para `index.html`
   - Permite React Router gerenciar a navegação no cliente

3. **API Routes**
   - `/api/trpc/*` - tRPC endpoints
   - `/api/oauth/callback` - OAuth callback
   - `/api/cms/login` - CMS login
   - `/api/cms/logout` - CMS logout

4. **Middleware Order** (CRÍTICO)
   ```
   1. express.json/urlencoded
   2. express.static (dist/public) ← DEVE SER PRIMEIRO
   3. Rotas específicas (/app/manifest.webmanifest, /app/sw.js)
   4. OAuth routes
   5. CMS routes
   6. tRPC routes
   7. SPA Fallback ← DEVE SER ÚLTIMO
   ```

## Porta

O servidor usa a variável de ambiente `PORT`:

```javascript
const port = process.env.PORT || 3000;
```

Railway atribui automaticamente uma porta. Não é necessário configurar.

## Database

O projeto usa Drizzle ORM com MySQL/TiDB.

### Migrations

Ao fazer deploy, as migrations são executadas automaticamente se você adicionar um script:

```json
{
  "scripts": {
    "db:push": "drizzle-kit push",
    "db:generate": "drizzle-kit generate",
    "postbuild": "pnpm db:push"
  }
}
```

## Troubleshooting

### Erro: "dist/public not found"

Certifique-se de que o build foi executado:
```bash
pnpm build
```

### Erro: "Cannot find module"

Limpe e reinstale dependências:
```bash
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Assets retornando 404

Verifique se `express.static` está configurado ANTES do SPA fallback em `server/_core/index.ts`.

### SPA não funciona

Certifique-se de que o middleware SPA fallback está sendo chamado APÓS `express.static`.

## Health Check

Railway fornece health checks automáticos. O servidor responde em:
- `GET /` - Retorna index.html (200)
- `GET /api/health` - Pode ser adicionado para health checks

## Logs

Visualize logs no Railway:
```bash
railway logs
```

## Domínio Customizado

1. Acesse Railway Dashboard
2. Vá para "Settings" → "Domains"
3. Adicione seu domínio customizado
4. Configure DNS conforme instruído

## Performance

### Otimizações aplicadas

- ✅ Vite build com minificação
- ✅ esbuild para servidor (rápido)
- ✅ Cache headers para assets estáticos
- ✅ Gzip compression (configure no Railway)

### Melhorias futuras

- [ ] Code splitting no frontend
- [ ] Lazy loading de rotas
- [ ] Image optimization
- [ ] Database connection pooling

## Suporte

Para problemas:
1. Verifique os logs: `railway logs`
2. Verifique variáveis de ambiente
3. Verifique conectividade de database
4. Verifique permissões de arquivo

## Referências

- [Railway Docs](https://docs.railway.app)
- [Express Docs](https://expressjs.com)
- [Vite Docs](https://vitejs.dev)
- [tRPC Docs](https://trpc.io)
- [Drizzle Docs](https://orm.drizzle.team)
