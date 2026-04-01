# 🎯 ORANJE CMS ADMIN - Guia de Implementação

## Visão Geral

O painel ADMIN foi transformado em um **CMS completo** com endpoints CRUD para todas as 8 entidades principais:
- Lugares (Places)
- Eventos (Events)
- Vouchers
- Anúncios (Ads)
- Parceiros (Partners)
- Roteiros (Routes)
- Categorias (Categories)
- Motoristas (Drivers)

## Arquitetura

### Backend (tRPC Endpoints)

**Arquivo:** `server/admin.router.ts`

Todos os endpoints estão sob `trpc.admin_cms.*` e requerem autenticação de admin:

```typescript
// Exemplos de uso:
trpc.admin_cms.places.list.useQuery()
trpc.admin_cms.places.byId.useQuery({ id: 1 })
trpc.admin_cms.places.create.useMutation()
trpc.admin_cms.places.update.useMutation()
trpc.admin_cms.places.delete.useMutation()
```

**Estrutura de cada router:**
- `list` - Listar todos os itens
- `byId` - Obter um item específico
- `create` - Criar novo item
- `update` - Atualizar item existente
- `delete` - Deletar item

### Frontend (Componentes Reutilizáveis)

#### 1. **AdminListTable.tsx**
Componente reutilizável para exibir listas com CRUD:

```typescript
<AdminListTable
  title="Lugares"
  columns={[
    { key: "name", label: "Nome", width: "30%" },
    { key: "address", label: "Endereço", width: "40%" },
    { key: "status", label: "Status", render: (value) => <span>{value}</span> },
  ]}
  data={places}
  isLoading={isLoading}
  onEdit={handleEdit}
  onDelete={handleDelete}
  onCreate={handleCreate}
  onSearch={handleSearch}
/>
```

**Props:**
- `title` - Título da seção
- `columns` - Array de colunas com `key`, `label`, `render` (opcional), `width` (opcional)
- `data` - Array de dados
- `isLoading` - Estado de carregamento
- `onEdit` - Callback ao clicar em editar
- `onDelete` - Callback ao clicar em deletar
- `onCreate` - Callback ao clicar em novo
- `onSearch` - Callback de busca (opcional)

#### 2. **AdminFormModal.tsx**
Componente reutilizável para criar/editar formulários:

```typescript
<AdminFormModal
  title="Novo Lugar"
  fields={[
    { name: "name", label: "Nome", type: "text", required: true },
    { name: "address", label: "Endereço", type: "text" },
    { name: "status", label: "Status", type: "select", options: [
      { value: "active", label: "Ativo" },
      { value: "inactive", label: "Inativo" },
    ]},
  ]}
  initialData={editingPlace}
  isOpen={isModalOpen}
  isLoading={isLoading}
  onClose={handleClose}
  onSubmit={handleSubmit}
/>
```

**Props:**
- `title` - Título do modal
- `fields` - Array de campos do formulário
- `initialData` - Dados iniciais (para edição)
- `isOpen` - Controla visibilidade
- `isLoading` - Estado de carregamento
- `onClose` - Callback ao fechar
- `onSubmit` - Callback ao submeter

**Tipos de campo suportados:**
- `text`, `textarea`, `email`, `number`, `date`, `select`, `checkbox`, `url`

#### 3. **AdminPlaces.tsx** (Exemplo de Implementação)
Componente completo para gerenciar Lugares:

```typescript
export function AdminPlaces() {
  const { data: places, isLoading, refetch } = trpc.places.list.useQuery({});
  const createPlace = trpc.places.create.useMutation();
  const updatePlace = trpc.places.update.useMutation();
  const deletePlace = trpc.places.delete.useMutation();
  
  // ... resto da lógica
}
```

## Como Implementar as Outras Abas

### Passo 1: Criar o Componente
Copie o padrão de `AdminPlaces.tsx`:

```typescript
// client/src/components/AdminEvents.tsx
import { AdminListTable } from "./AdminListTable";
import { AdminFormModal } from "./AdminFormModal";

const EVENT_FORM_FIELDS = [
  { name: "title", label: "Título", type: "text", required: true },
  { name: "description", label: "Descrição", type: "textarea" },
  { name: "startsAt", label: "Data de Início", type: "date", required: true },
  { name: "endsAt", label: "Data de Término", type: "date" },
  { name: "location", label: "Local", type: "text" },
  { name: "coverImage", label: "URL da Imagem", type: "url" },
  { name: "isFeatured", label: "Em Destaque", type: "checkbox" },
  { name: "status", label: "Status", type: "select", options: [
    { value: "active", label: "Ativo" },
    { value: "cancelled", label: "Cancelado" },
    { value: "past", label: "Passado" },
  ]},
];

export function AdminEvents() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any>(null);

  const { data: events, isLoading, refetch } = trpc.events.list.useQuery({});
  const createEvent = trpc.events.create.useMutation();
  const updateEvent = trpc.events.update.useMutation();
  const deleteEvent = trpc.events.delete.useMutation();

  // ... implementar handlers (handleCreate, handleEdit, handleDelete, handleSubmit)

  return (
    <>
      <AdminListTable
        title="Eventos"
        columns={[
          { key: "title", label: "Título", width: "40%" },
          { key: "startsAt", label: "Data", width: "30%" },
          { key: "status", label: "Status", width: "30%" },
        ]}
        data={events}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onCreate={handleCreate}
      />

      <AdminFormModal
        title={editingEvent ? "Editar Evento" : "Novo Evento"}
        fields={EVENT_FORM_FIELDS}
        initialData={editingEvent || undefined}
        isOpen={isModalOpen}
        isLoading={createEvent.isPending || updateEvent.isPending}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
      />
    </>
  );
}
```

### Passo 2: Importar no Admin.tsx
```typescript
import { AdminEvents } from "@/components/AdminEvents";

// Dentro do componente:
{activeTab === "events" && <AdminEvents />}
```

### Passo 3: Remover Placeholder
```typescript
// Remover:
function AdminEvents() { return <div>...</div>; }
```

## Campos de Cada Entidade

### Places (Lugares)
- name, shortDesc, longDesc, address, whatsapp, instagram, website, coverImage
- priceRange, isFeatured, isRecommended, status, rating, reviewCount

### Events (Eventos)
- title, description, startsAt, endsAt, location, mapsUrl, coverImage
- isFeatured, tags, price, status

### Vouchers
- placeId, title, description, code, qrPayload, discount
- startsAt, endsAt, isActive

### Ads (Anúncios)
- title, description, imageUrl, linkUrl, placement (footer_banner, offers_page, home_banner)
- startsAt, endsAt, isActive

### Partners (Parceiros)
- name, plan (Essencial, Destaque, Premium), contactName, contactWhatsapp, contactEmail
- logoUrl, status (pending, active, inactive)

### Routes (Roteiros)
- title, description, placeIds[], duration, theme, isPublic, coverImage, tags

### Categories (Categorias)
- name, slug, icon, description, coverImage, isActive

### Drivers (Motoristas)
- name, whatsapp, serviceType, area, capacity, notes, photoUrl, status, isPartner, isVerified

## Upload de Imagens

Para integrar upload de imagens, use o helper `storagePut` do servidor:

```typescript
// Backend (tRPC procedure)
import { storagePut } from "./server/storage";

upload: adminProcedure.input(z.object({
  file: z.instanceof(File),
  type: z.enum(["place", "event", "ad"]),
})).mutation(async ({ input }) => {
  const buffer = await input.file.arrayBuffer();
  const { url } = await storagePut(
    `${input.type}/${Date.now()}-${input.file.name}`,
    new Uint8Array(buffer),
    input.file.type
  );
  return { url };
}),
```

## Logging de Ações

Todas as ações de CRUD são automaticamente registradas em `admin_logs`:

```typescript
await db.logAdminAction(userId, "create_place", "place", placeId);
await db.logAdminAction(userId, "update_event", "event", eventId);
await db.logAdminAction(userId, "delete_voucher", "voucher", voucherId);
```

Visualize no tab "Logs" do ADMIN.

## Segurança

- ✅ Todos os endpoints requerem `adminProcedure` (verificação de role)
- ✅ Ações são registradas com ID do admin
- ✅ Validação de schema com Zod
- ✅ Proteção contra SQL injection (Drizzle ORM)

## Próximos Passos

1. **Implementar as 6 abas restantes** usando o padrão de `AdminPlaces.tsx`
2. **Adicionar upload de imagens** com S3 integration
3. **Criar filtros avançados** (por status, data, etc)
4. **Adicionar paginação** para listas grandes
5. **Implementar validações customizadas** (WhatsApp normalization, etc)
6. **Adicionar testes** para os endpoints CRUD

## Checklist de Implementação

- [ ] AdminEvents
- [ ] AdminVouchers
- [ ] AdminAds
- [ ] AdminPartners
- [ ] AdminRoutes
- [ ] AdminCategories
- [ ] Upload de imagens
- [ ] Filtros avançados
- [ ] Paginação
- [ ] Testes

---

**Status:** MVP funcional com base sólida para expansão
**Última atualização:** 2026-03-03
