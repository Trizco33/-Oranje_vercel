# Investigação: Por que a página Explore não renderiza

## 1️⃣ COMPONENTE CategoryList.tsx

### ✅ Código de Renderização
```typescript
export default function CategoryList() {
  console.log('[CategoryList] rendered');
  const { data: categories } = trpc.categories.list.useQuery();
  console.log('[CategoryList] rendered, categories:', categories);

  return (
    <div className="oranje-app min-h-screen">
      {/* ... */}
      <div className="px-4 mt-2 flex flex-col gap-3">
        {categories?.map(cat => {
          // Renderiza cada categoria como card
        })}
      </div>
    </div>
  );
}
```

### ✅ Análise do Código
- **Linha 15:** Chama `trpc.categories.list.useQuery()` corretamente
- **Linha 16:** Log para debug já existe
- **Linha 29:** Usa `categories?.map()` com optional chaining (seguro)
- **Nenhum filtro extra:** Não há `cat.isActive === true` ou similar
- **Sem condição de renderização:** Não há `if (categories?.length > 0)`

### ❌ Problema: Logs não aparecem no console
```
Esperado: [CategoryList] rendered, categories: [...]
Encontrado: NADA
```

---

## 2️⃣ DADOS DA API

### ✅ Query funciona corretamente
```
Endpoint: trpc.categories.list
Função: db.getCategories()
Resultado: 7 categorias retornadas
Status: ✅ FUNCIONANDO
```

### ✅ Dados disponíveis
```json
[
  {
    "id": 3,
    "name": "Bares & Drinks",
    "slug": "bares",
    "icon": "Wine",
    "description": "Cervejas artesanais, vinhos e coquetéis",
    "coverImage": null,
    "isActive": true,
    "createdAt": "2026-02-27T04:08:07.000Z"
  },
  // ... mais 6 categorias
]
```

---

## 3️⃣ ROTEAMENTO

### ✅ Rotas registradas em App.tsx
```typescript
<Route path="/app/explorar" element={<Explore />} />
<Route path="/app/explorar/:slug" element={<Explore />} />
```

### ✅ Componente Explore.tsx
```typescript
export default function Explore() {
  const { slug } = useParams<{ slug?: string }>();
  
  if (slug) {
    return <CategoryDetail slug={slug} />;
  }
  
  return <CategoryList />;
}
```

---

## 4️⃣ ERRO CRÍTICO ENCONTRADO

### 🔴 NotificationCenter.tsx - Loop infinito de re-renders

**Localização:** `src/components/NotificationCenter.tsx:40-45`

```typescript
useEffect(() => {
  const interval = setInterval(() => {
    refetch();
  }, 10000);
  return () => clearInterval(interval);
}, [refetch]);  // ⚠️ PROBLEMA AQUI
```

**Problema:**
- `refetch` é uma função que muda a cada render
- Quando `refetch` muda → useEffect executa
- useEffect chama `refetch()` → novo render
- `refetch` muda novamente → volta ao passo 1
- **Resultado:** Loop infinito de re-renders

**Erro no console:**
```
Maximum update depth exceeded. This can happen when a component calls setState 
inside useEffect, but useEffect either doesn't have a dependency array, or one 
of the dependencies changes on every render.
```

**Impacto:**
- React fica sobrecarregado com re-renders infinitos
- Componentes filhos (como Explore) não conseguem renderizar
- CategoryList nunca é executado
- Logs nunca aparecem

---

## 5️⃣ FLUXO DO PROBLEMA

```
1. App.tsx renderiza
   ↓
2. NotificationCenter renderiza
   ↓
3. useEffect com [refetch] executa
   ↓
4. refetch() é chamado
   ↓
5. Novo render → refetch muda de referência
   ↓
6. useEffect executa novamente (volta ao passo 3)
   ↓
7. ∞ Loop infinito
   ↓
8. React fica travado
   ↓
9. Explore não consegue renderizar
   ↓
10. CategoryList.tsx nunca executa
    ↓
11. Logs nunca aparecem
    ↓
12. Página fica vazia
```

---

## 6️⃣ CHECKLIST DE INVESTIGAÇÃO

| Item | Status | Evidência |
|------|--------|-----------|
| CategoryList.tsx existe | ✅ | Arquivo encontrado em `/client/src/pages/CategoryList.tsx` |
| CategoryList.tsx chama API corretamente | ✅ | `trpc.categories.list.useQuery()` na linha 15 |
| CategoryList.tsx tem logs | ✅ | `console.log()` nas linhas 14 e 16 |
| Rota /app/explorar está registrada | ✅ | Linha 48 em `App.tsx` |
| Dados da API estão disponíveis | ✅ | 7 categorias retornadas com sucesso |
| Logs do CategoryList aparecem no console | ❌ | Nenhum log encontrado em `.manus-logs/browserConsole.log` |
| Há erro silencioso no console | ✅ | "Maximum update depth exceeded" |
| Há loop infinito de re-renders | ✅ | NotificationCenter com `[refetch]` como dependência |
| CategoryList renderiza | ❌ | Nunca é executado devido ao loop infinito |
| Explore renderiza | ❌ | Travado pelo NotificationCenter |

---

## 7️⃣ CAUSA RAIZ

**NotificationCenter.tsx está causando loop infinito de re-renders que impede a renderização de qualquer componente na aplicação, incluindo Explore.**

### Código problemático:
```typescript
// ❌ ERRADO
useEffect(() => {
  const interval = setInterval(() => {
    refetch();
  }, 10000);
  return () => clearInterval(interval);
}, [refetch]);  // refetch muda a cada render!
```

### Solução necessária:
```typescript
// ✅ CORRETO
useEffect(() => {
  const interval = setInterval(() => {
    refetch();
  }, 10000);
  return () => clearInterval(interval);
}, [refetch]);  // Usar useCallback para estabilizar refetch
```

Ou remover `refetch` da dependência se não for necessário.

---

## 📊 RESUMO

| Aspecto | Resultado |
|---------|-----------|
| **API funciona** | ✅ Sim |
| **Dados disponíveis** | ✅ Sim (7 categorias) |
| **Rota registrada** | ✅ Sim |
| **Componente existe** | ✅ Sim |
| **Renderização funciona** | ❌ Não |
| **Causa** | NotificationCenter loop infinito |
| **Solução** | Corrigir useEffect em NotificationCenter.tsx |

---

## ✅ PRÓXIMAS AÇÕES

1. **Corrigir NotificationCenter.tsx** - Remover `refetch` da dependência ou usar `useCallback`
2. **Testar Explore** - Confirmar que renderiza após correção
3. **Validar logs** - Confirmar que CategoryList logs aparecem no console
4. **Testar renderização** - Confirmar que 7 categorias aparecem como cards
