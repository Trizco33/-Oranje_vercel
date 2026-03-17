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
      <div className="flex items-center justify-between mb-4">
        <h2 className="section-title text-lg">{title}</h2>
        <button
          onClick={onCreate}
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all"
          style={{ backgroundColor: "#D88A3D", color: "#0F1B14" }}
        >
          <Plus size={16} />
          Novo
        </button>
      </div>

      {/* Search */}
      {onSearch && (
        <div className="mb-4 relative">
          <Search size={16} className="absolute left-3 top-3" style={{ color: "#C8C5C0" }} />
          <input
            type="text"
            placeholder="Buscar..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg text-sm"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(216,138,61,0.2)",
              color: "#E8E6E3",
            }}
          />
        </div>
      )}

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={20} className="animate-spin" style={{ color: "#D88A3D" }} />
        </div>
      ) : !data || data.length === 0 ? (
        <div className="glass-card p-8 text-center">
          <p style={{ color: "#C8C5C0" }}>Nenhum item encontrado.</p>
        </div>
      ) : (
        <div className="glass-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(216,138,61,0.2)" }}>
                {columns.map((col) => (
                  <th
                    key={String(col.key)}
                    className="text-left px-4 py-3"
                    style={{ color: "#D88A3D", fontWeight: 600, width: col.width }}
                  >
                    {col.label}
                  </th>
                ))}
                <th className="text-left px-4 py-3" style={{ color: "#D88A3D", fontWeight: 600 }}>
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <tr key={item.id} style={{ borderBottom: "1px solid rgba(216,138,61,0.1)" }}>
                  {columns.map((col) => (
                    <td key={String(col.key)} className="px-4 py-3" style={{ color: "#E8E6E3" }}>
                      {col.render ? col.render(item[col.key], item) : String(item[col.key] ?? "-")}
                    </td>
                  ))}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onEdit(item)}
                        className="p-2 rounded-lg transition-all"
                        style={{ background: "rgba(216,138,61,0.1)" }}
                        title="Editar"
                      >
                        <Edit2 size={14} style={{ color: "#D88A3D" }} />
                      </button>
                      <button
                        onClick={() => handleDelete(item)}
                        disabled={deletingId === item.id}
                        className="p-2 rounded-lg transition-all disabled:opacity-50"
                        style={{ background: "rgba(255,100,100,0.1)" }}
                        title="Deletar"
                      >
                        {deletingId === item.id ? (
                          <Loader2 size={14} className="animate-spin" style={{ color: "#FF6464" }} />
                        ) : (
                          <Trash2 size={14} style={{ color: "#FF6464" }} />
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
