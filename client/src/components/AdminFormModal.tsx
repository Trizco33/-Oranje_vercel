import { X, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { ImageUpload } from "./ImageUpload";

interface FormField {
  name: string;
  label: string;
  type: "text" | "textarea" | "email" | "number" | "date" | "select" | "checkbox" | "url" | "image";
  required?: boolean;
  placeholder?: string;
  options?: { value: string | number; label: string }[];
  defaultValue?: any;
}

interface AdminFormModalProps {
  title: string;
  fields: FormField[];
  initialData?: Record<string, any>;
  isOpen: boolean;
  isLoading: boolean;
  onClose: () => void;
  onSubmit: (data: Record<string, any>) => void;
}

export function AdminFormModal({
  title,
  fields,
  initialData,
  isOpen,
  isLoading,
  onClose,
  onSubmit,
}: AdminFormModalProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      const initial: Record<string, any> = {};
      fields.forEach((field) => {
        initial[field.name] = field.defaultValue ?? "";
      });
      setFormData(initial);
    }
  }, [initialData, fields, isOpen]);

  const handleChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div
        className="rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
        style={{ background: "#0F1B14", border: "1px solid rgba(216,138,61,0.2)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold" style={{ color: "#E8E6E3" }}>
            {title}
          </h2>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-2 rounded-lg transition-all disabled:opacity-50"
            style={{ background: "rgba(216,138,61,0.1)" }}
          >
            <X size={16} style={{ color: "#D88A3D" }} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map((field) => (
            <div key={field.name}>
              <label className="block text-sm font-medium mb-2" style={{ color: "#E8E6E3" }}>
                {field.label}
                {field.required && <span style={{ color: "#FF6464" }}>*</span>}
              </label>

              {field.type === "textarea" ? (
                <textarea
                  name={field.name}
                  value={formData[field.name] ?? ""}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  placeholder={field.placeholder}
                  required={field.required}
                  rows={4}
                  className="w-full px-3 py-2 rounded-lg text-sm resize-none"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(216,138,61,0.2)",
                    color: "#E8E6E3",
                  }}
                />
              ) : field.type === "select" ? (
                <select
                  name={field.name}
                  value={formData[field.name] ?? ""}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  required={field.required}
                  className="w-full px-3 py-2 rounded-lg text-sm"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(216,138,61,0.2)",
                    color: "#E8E6E3",
                  }}
                >
                  <option value="">Selecione uma opção</option>
                  {field.options?.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              ) : field.type === "checkbox" ? (
                <input
                  type="checkbox"
                  name={field.name}
                  checked={formData[field.name] ?? false}
                  onChange={(e) => handleChange(field.name, e.target.checked)}
                  className="w-4 h-4 rounded"
                  style={{ accentColor: "#D88A3D" }}
                />
              ) : field.type === "image" ? (
                <div className="flex items-center gap-2">
                  {formData[field.name] && (
                    <img
                      src={formData[field.name]}
                      alt="preview"
                      className="w-12 h-12 rounded object-cover"
                    />
                  )}
                  <ImageUpload
                    onUpload={(url) => handleChange(field.name, url)}
                    isLoading={isLoading}
                    label="Upload"
                  />
                </div>
              ) : (
                <input
                  type={field.type}
                  name={field.name}
                  value={formData[field.name] ?? ""}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  placeholder={field.placeholder}
                  required={field.required}
                  className="w-full px-3 py-2 rounded-lg text-sm"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(216,138,61,0.2)",
                    color: "#E8E6E3",
                  }}
                />
              )}
            </div>
          ))}

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2 rounded-lg font-medium transition-all disabled:opacity-50"
              style={{ background: "rgba(216,138,61,0.1)", color: "#D88A3D" }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              style={{ backgroundColor: "#D88A3D", color: "#0F1B14" }}
            >
              {isLoading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
