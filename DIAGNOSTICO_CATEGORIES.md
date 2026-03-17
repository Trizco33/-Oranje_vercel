# Diagnóstico: Tabela `categories` - Divergência entre MySQL e Schema TypeScript

## 1️⃣ ESTRUTURA REAL NO MYSQL

```
Coluna          | Tipo           | Nullable | Default
─────────────────────────────────────────────────────
id              | int            | NO       | NULL
name            | varchar(100)   | NO       | NULL
slug            | varchar(100)   | NO       | NULL
icon            | varchar(50)    | YES      | NULL
description     | text           | YES      | NULL
coverImage      | text           | YES      | NULL
createdAt       | timestamp      | NO       | CURRENT_TIMESTAMP
```

**Total de colunas no banco: 7**

---

## 2️⃣ SCHEMA ESPERADO (TypeScript/Drizzle)

```typescript
export const categories = mysqlTable("categories", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  icon: varchar("icon", { length: 50 }),
  description: text("description"),
  coverImage: text("coverImage"),
  isActive: boolean("isActive").default(true).notNull(),  // ⚠️ COLUNA AUSENTE NO BANCO
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
```

**Total de colunas no schema: 8**

---

## 3️⃣ COMPARAÇÃO DETALHADA

| Coluna | MySQL | Schema TS | Status |
|--------|-------|-----------|--------|
| `id` | ✅ int | ✅ int | ✅ OK |
| `name` | ✅ varchar(100) NOT NULL | ✅ varchar(100) notNull | ✅ OK |
| `slug` | ✅ varchar(100) NOT NULL UNIQUE | ✅ varchar(100) notNull unique | ✅ OK |
| `icon` | ✅ varchar(50) NULL | ✅ varchar(50) | ✅ OK |
| `description` | ✅ text NULL | ✅ text | ✅ OK |
| `coverImage` | ✅ text NULL | ✅ text | ✅ OK |
| `isActive` | ❌ **NÃO EXISTE** | ✅ boolean default(true) notNull | ❌ **DIVERGÊNCIA** |
| `createdAt` | ✅ timestamp DEFAULT CURRENT_TIMESTAMP | ✅ timestamp defaultNow() notNull | ✅ OK |

---

## 4️⃣ DIVERGÊNCIAS IDENTIFICADAS

### ❌ Coluna Ausente: `isActive`
- **Esperado no schema:** `boolean("isActive").default(true).notNull()`
- **Encontrado no banco:** ❌ NÃO EXISTE
- **Impacto:** Qualquer query que selecione `isActive` falhará com erro `Unknown column 'isactive'`

---

## 5️⃣ ERRO DETALHADO DA QUERY

### Query que falha:
```sql
SELECT `id`, `name`, `slug`, `icon`, `description`, `coverImage`, `isActive`, `createdAt` 
FROM `categories` 
ORDER BY `categories`.`name`
```

### Erro retornado:
```
DrizzleQueryError: Failed query: select `id`, `name`, `slug`, `icon`, `description`, `coverImage`, `isActive`, `createdAt` from `categories` order by `categories`.`name`

Cause: Error: Unknown column 'isactive' in 'field list'
Code: ER_BAD_FIELD_ERROR (1054)
```

### Stack completo:
```
at MySql2PreparedQuery.queryWithCache 
  (/node_modules/drizzle-orm/src/mysql-core/session.ts:79:11)
at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
at async MySql2PreparedQuery.execute 
  (/node_modules/drizzle-orm/src/mysql2/session.ts:132:18)
at async MySqlSelectBase.execute 
  (/node_modules/drizzle-orm/src/mysql-core/query-builders/select.ts:1145:25)
at async MySqlSelectBase.then 
  (/node_modules/drizzle-orm/src/query-promise.ts:31:15)

Cause: PromisePool.query error
  (/node_modules/mysql2/lib/promise/pool.js:36:22)
```

---

## 6️⃣ FUNÇÕES AFETADAS

### Em `server/db.ts`:

1. **`getCategories()`** (linha 60)
   ```typescript
   return db.select().from(categories).orderBy(categories.name);
   ```
   - Seleciona todas as colunas (incluindo `isActive`)
   - ❌ FALHA: Coluna `isActive` não existe

2. **`getAllCategories()`** (linha 64)
   ```typescript
   return db.select().from(categories);
   ```
   - Seleciona todas as colunas (incluindo `isActive`)
   - ❌ FALHA: Coluna `isActive` não existe

3. **`getCategoryBySlug()`** (linha 66)
   ```typescript
   return db.select().from(categories).where(eq(categories.slug, slug)).limit(1);
   ```
   - Seleciona todas as colunas (incluindo `isActive`)
   - ❌ FALHA: Coluna `isActive` não existe

### Impacto em tRPC:
- **`trpc.categories.list`** → chama `db.getCategories()` → ❌ FALHA
- **`trpc.categories.bySlug`** → chama `db.getCategoryBySlug()` → ❌ FALHA

### Impacto em Frontend:
- **`CategoryList.tsx`** → `trpc.categories.list.useQuery()` → ❌ Retorna `undefined`
- **`CategoryDetail.tsx`** → `trpc.categories.bySlug.useQuery()` → ❌ Retorna `undefined`
- **Resultado:** Página Explore renderiza vazia (sem cards)

---

## 7️⃣ ORIGEM DO PROBLEMA

### Migração inicial (0001_aberrant_triathlon.sql):
```sql
CREATE TABLE `categories` (
  `id` int AUTO_INCREMENT NOT NULL,
  `name` varchar(100) NOT NULL,
  `slug` varchar(100) NOT NULL,
  `icon` varchar(50),
  `description` text,
  `coverImage` text,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT `categories_id` PRIMARY KEY(`id`),
  CONSTRAINT `categories_slug_unique` UNIQUE(`slug`)
);
```
- ❌ Não inclui `isActive`

### Schema TypeScript (drizzle/schema.ts):
```typescript
isActive: boolean("isActive").default(true).notNull(),
```
- ✅ Define `isActive` mas não foi migrado para o banco

### Resultado:
- Schema e banco estão **desincronizados**
- Queries falham silenciosamente
- Frontend recebe `undefined` em vez de array vazio
- Nenhuma categoria é renderizada

---

## 📊 RESUMO EXECUTIVO

| Aspecto | Status |
|---------|--------|
| **Colunas no MySQL** | 7 |
| **Colunas no Schema** | 8 |
| **Coluna faltante** | `isActive` |
| **Queries afetadas** | 3 (getCategories, getAllCategories, getCategoryBySlug) |
| **Endpoints tRPC afetados** | 2 (categories.list, categories.bySlug) |
| **Páginas afetadas** | 2 (CategoryList, CategoryDetail) |
| **Erro MySQL** | ER_BAD_FIELD_ERROR (1054) |
| **Mensagem** | Unknown column 'isactive' in 'field list' |

---

## ✅ PRÓXIMAS AÇÕES

**Opção 1: Adicionar coluna `isActive` ao banco**
- Criar migração que adiciona `isActive BOOLEAN DEFAULT true`
- Executar `pnpm db:push`
- Queries funcionarão normalmente

**Opção 2: Remover `isActive` do schema**
- Remover `isActive` de `drizzle/schema.ts`
- Executar `pnpm db:push`
- Queries funcionarão sem filtro de status

Qual opção deseja implementar?
