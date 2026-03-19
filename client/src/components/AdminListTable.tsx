import { useState } from "react";
import { Edit2, Trash2, Plus, Loader2, Search } from "lucide-react";
import { toast } from "sonner";

interface Column<T> {
  key: keyof T;
  label: string;
  render?: (value: any, item: T) => React.ReactNode;
  width?: string;
}

interface AdminListTableProps<T extends { id: number | string }> {
  title: string;
  columns: Column<T>[];
  data: T[] | undefined;
  isLoading: boolean;
  onEdit: (item: T) => void;
  onDelete: (item: T) => void;
  onCreate: () => void;
  onSearch?: (query: string) => void;
  deleteLoading?: boolean;
}

export function AdminListTable<T extends { id: number | string }>({
  title,
  columns,
  data,
  isLoading,
  onEdit,
  onDelete,
  onCreate,
  onSearch,
  deleteLoading,
}: AdminListTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState("");
  const [deletingId, setDeletingId] = useState<number | string | null>(null);

  const handleDelete = async (item: T) => {
    if (!confirm(`Tem certeza que deseja deletar este item?`)) return;
    setDeletingId(item.id);
    try {
      onDelete(item);
    } finally {
      setDeletingId(null);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    onSearch?.(query);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 style={{
          fontSize: '1.25rem',
          fontWeight: 700,
          color: 'var(--admin-text-primary, #1A1A1A)',
          fontFamily: "'Montserrat', system-ui, sans-serif",
        }}>{title}</h2>
        <button
          onClick={onCreate}
          className="admin-btn-primary"
        >
          <Plus size={16} />
          Novo
        </button>
      </div>

      {/* Search */}
      {onSearch && (
        <div className="mb-4 relative">
          <Search size={16} style={{
            position: 'absolute',
            left: '14px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--admin-text-muted, #718096)',
          }} />
          <input
            type="text"
            placeholder="Buscar..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="admin-input"
            style={{ paddingLeft: '40px' }}
          />
        </div>
      )}

      {/* Table / Cards */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={24} className="animate-spin" style={{ color: 'var(--admin-orange, #E65100)' }} />
        </div>
      ) : !data || data.length === 0 ? (
        <div className="admin-card" style={{ padding: '48px 24px', textAlign: 'center' }}>
          <p style={{ color: 'var(--admin-text-muted, #718096)', fontSize: '0.875rem' }}>
            Nenhum item encontrado.
          </p>
        </div>
      ) : (
        <div className="admin-card">
          <table className="admin-table-responsive" style={{ width: '100%', fontSize: '0.875rem', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--admin-border, rgba(0,37,26,0.08))' }}>
                {columns.map((col) => (
                  <th
                    key={String(col.key)}
                    style={{
                      textAlign: 'left',
                      padding: '12px 16px',
                      color: 'var(--admin-text-muted, #718096)',
                      fontWeight: 600,
                      fontSize: '0.75rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      width: col.width,
                    }}
                  >
                    {col.label}
                  </th>
                ))}
                <th style={{
                  textAlign: 'left',
                  padding: '12px 16px',
                  color: 'var(--admin-text-muted, #718096)',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  width: '100px',
                }}>
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <tr key={item.id} style={{ borderBottom: '1px solid var(--admin-border-light, rgba(0,37,26,0.05))' }}>
                  {columns.map((col) => (
                    <td
                      key={String(col.key)}
                      data-label={col.label}
                      style={{
                        padding: '14px 16px',
                        color: 'var(--admin-text-primary, #1A1A1A)',
                      }}
                    >
                      {col.render ? col.render(item[col.key], item) : String(item[col.key] ?? "-")}
                    </td>
                  ))}
                  <td data-label="Ações" style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        onClick={() => onEdit(item)}
                        style={{
                          padding: '8px',
                          borderRadius: '8px',
                          border: '1px solid var(--admin-border, rgba(0,37,26,0.08))',
                          background: 'transparent',
                          cursor: 'pointer',
                          transition: 'all 200ms ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          minWidth: '36px',
                          minHeight: '36px',
                        }}
                        title="Editar"
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(230, 81, 0, 0.06)';
                          e.currentTarget.style.borderColor = 'rgba(230, 81, 0, 0.2)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.borderColor = 'var(--admin-border, rgba(0,37,26,0.08))';
                        }}
                      >
                        <Edit2 size={14} style={{ color: 'var(--admin-orange, #E65100)' }} />
                      </button>
                      <button
                        onClick={() => handleDelete(item)}
                        disabled={deletingId === item.id}
                        style={{
                          padding: '8px',
                          borderRadius: '8px',
                          border: '1px solid var(--admin-border, rgba(0,37,26,0.08))',
                          background: 'transparent',
                          cursor: 'pointer',
                          transition: 'all 200ms ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          opacity: deletingId === item.id ? 0.5 : 1,
                          minWidth: '36px',
                          minHeight: '36px',
                        }}
                        title="Deletar"
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(248, 113, 113, 0.06)';
                          e.currentTarget.style.borderColor = 'rgba(248, 113, 113, 0.2)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.borderColor = 'var(--admin-border, rgba(0,37,26,0.08))';
                        }}
                      >
                        {deletingId === item.id ? (
                          <Loader2 size={14} className="animate-spin" style={{ color: '#F87171' }} />
                        ) : (
                          <Trash2 size={14} style={{ color: '#F87171' }} />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
