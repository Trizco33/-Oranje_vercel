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

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1px solid rgba(0, 37, 26, 0.1)',
    background: '#FFFFFF',
    color: '#1A1A1A',
    fontSize: '0.875rem',
    fontFamily: "'Montserrat', system-ui, sans-serif",
    transition: 'border-color 200ms ease',
    minHeight: '44px',
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.4)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 50,
      padding: '16px',
      backdropFilter: 'blur(4px)',
    }}>
      <div style={{
        borderRadius: '16px',
        padding: '28px',
        width: '100%',
        maxWidth: '480px',
        maxHeight: '90vh',
        overflowY: 'auto',
        background: '#FFFFFF',
        border: '1px solid rgba(0, 37, 26, 0.08)',
        boxShadow: '0 8px 32px rgba(0, 37, 26, 0.12)',
        fontFamily: "'Montserrat', system-ui, sans-serif",
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '24px',
        }}>
          <h2 style={{
            fontSize: '1.125rem',
            fontWeight: 700,
            color: '#1A1A1A',
          }}>
            {title}
          </h2>
          <button
            onClick={onClose}
            disabled={isLoading}
            style={{
              padding: '8px',
              borderRadius: '8px',
              border: '1px solid rgba(0, 37, 26, 0.08)',
              background: 'transparent',
              cursor: 'pointer',
              opacity: isLoading ? 0.5 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 200ms ease',
            }}
          >
            <X size={16} style={{ color: '#718096' }} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {fields.map((field) => (
            <div key={field.name}>
              <label style={{
                display: 'block',
                fontSize: '0.8125rem',
                fontWeight: 600,
                marginBottom: '6px',
                color: '#4A5568',
              }}>
                {field.label}
                {field.required && <span style={{ color: '#E65100', marginLeft: '2px' }}>*</span>}
              </label>

              {field.type === "textarea" ? (
                <textarea
                  name={field.name}
                  value={formData[field.name] ?? ""}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  placeholder={field.placeholder}
                  required={field.required}
                  rows={4}
                  style={{ ...inputStyle, resize: 'none' as const, minHeight: '100px' }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#E65100';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(230, 81, 0, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(0, 37, 26, 0.1)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              ) : field.type === "select" ? (
                <select
                  name={field.name}
                  value={formData[field.name] ?? ""}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  required={field.required}
                  style={inputStyle}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#E65100';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(230, 81, 0, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(0, 37, 26, 0.1)';
                    e.currentTarget.style.boxShadow = 'none';
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
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    name={field.name}
                    checked={formData[field.name] ?? false}
                    onChange={(e) => handleChange(field.name, e.target.checked)}
                    style={{ width: '18px', height: '18px', accentColor: '#E65100', cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '0.875rem', color: '#4A5568' }}>Ativado</span>
                </label>
              ) : field.type === "image" ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {formData[field.name] && (
                    <img
                      src={formData[field.name]}
                      alt="preview"
                      style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover', border: '1px solid rgba(0,37,26,0.08)' }}
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
                  style={inputStyle}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#E65100';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(230, 81, 0, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(0, 37, 26, 0.1)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              )}
            </div>
          ))}

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '12px', paddingTop: '8px' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="admin-btn-secondary"
              style={{ flex: 1, opacity: isLoading ? 0.5 : 1 }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="admin-btn-primary"
              style={{ flex: 1, opacity: isLoading ? 0.7 : 1 }}
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
