import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

export interface ConfirmModalConfig {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'primary' | 'success';
  onConfirm: () => void | Promise<void>;
}

export interface PromptModalConfig {
  title: string;
  message: string;
  placeholder?: string;
  confirmText?: string;
  onConfirm: (inputValue: string) => void | Promise<void>;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
  showConfirm: (config: ConfirmModalConfig) => void;
  showPrompt: (config: PromptModalConfig) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [confirmConfig, setConfirmConfig] = useState<ConfirmModalConfig | null>(null);
  const [promptConfig, setPromptConfig] = useState<PromptModalConfig | null>(null);
  const [promptValue, setPromptValue] = useState('');
  const [loading, setLoading] = useState(false);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showConfirm = useCallback((config: ConfirmModalConfig) => {
    setConfirmConfig(config);
  }, []);

  const showPrompt = useCallback((config: PromptModalConfig) => {
    setPromptValue('');
    setPromptConfig(config);
  }, []);

  const handleConfirmAction = async () => {
    if (!confirmConfig) return;
    setLoading(true);
    try {
      await confirmConfig.onConfirm();
    } finally {
      setLoading(false);
      setConfirmConfig(null);
    }
  };

  const handlePromptAction = async () => {
    if (!promptConfig) return;
    if (!promptValue.trim()) return;
    setLoading(true);
    try {
      await promptConfig.onConfirm(promptValue.trim());
    } finally {
      setLoading(false);
      setPromptConfig(null);
      setPromptValue('');
    }
  };

  return (
    <ToastContext.Provider value={{ showToast, showConfirm, showPrompt }}>
      {children}

      {/* Floating Toast Containers (Top Right) */}
      <div style={{ position: 'fixed', top: '24px', right: '24px', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '400px', width: 'calc(100% - 48px)' }}>
        {toasts.map((toast) => {
          const isSuccess = toast.type === 'success';
          const isError = toast.type === 'error';
          const isWarning = toast.type === 'warning';

          const bgColor = isSuccess
            ? 'rgba(6, 78, 59, 0.95)'
            : isError
            ? 'rgba(127, 29, 29, 0.95)'
            : isWarning
            ? 'rgba(120, 53, 15, 0.95)'
            : 'rgba(30, 58, 138, 0.95)';

          const borderColor = isSuccess
            ? '#10b981'
            : isError
            ? '#ef4444'
            : isWarning
            ? '#f59e0b'
            : '#38bdf8';

          const Icon = isSuccess
            ? CheckCircle2
            : isError
            ? AlertCircle
            : isWarning
            ? AlertTriangle
            : Info;

          return (
            <div
              key={toast.id}
              style={{
                background: bgColor,
                borderLeft: `4px solid ${borderColor}`,
                backdropFilter: 'blur(16px)',
                borderRadius: '12px',
                padding: '14px 18px',
                color: '#ffffff',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                animation: 'toastIn 0.3s ease-out',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Icon size={20} color={borderColor} style={{ flexShrink: 0 }} />
                <span style={{ fontSize: '0.92rem', fontWeight: 600, lineHeight: '1.4' }}>{toast.message}</span>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px', display: 'flex' }}
              >
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>

      {/* Modern Confirmation Modal */}
      {confirmConfig && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '440px', padding: '28px', textAlign: 'center' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: confirmConfig.variant === 'danger' ? 'rgba(239,68,68,0.15)' : 'rgba(56,189,248,0.15)', color: confirmConfig.variant === 'danger' ? '#ef4444' : '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px auto' }}>
              {confirmConfig.variant === 'danger' ? <AlertTriangle size={28} /> : <Info size={28} />}
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '10px' }}>{confirmConfig.title}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '24px', lineHeight: '1.6' }}>{confirmConfig.message}</p>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={() => setConfirmConfig(null)}
                className="btn-secondary"
                disabled={loading}
                style={{ flex: 1, justifyContent: 'center' }}
              >
                {confirmConfig.cancelText || 'Cancel'}
              </button>
              <button
                onClick={handleConfirmAction}
                className={confirmConfig.variant === 'danger' ? 'btn-danger' : 'btn-primary'}
                disabled={loading}
                style={{ flex: 1, justifyContent: 'center' }}
              >
                {loading ? 'Processing...' : confirmConfig.confirmText || 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modern Input Prompt Modal */}
      {promptConfig && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '480px', padding: '28px' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '8px' }}>{promptConfig.title}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>{promptConfig.message}</p>

            <div className="input-group">
              <input
                type="text"
                className="input-field"
                placeholder={promptConfig.placeholder || 'Enter value...'}
                value={promptValue}
                onChange={(e) => setPromptValue(e.target.value)}
                autoFocus
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button onClick={() => setPromptConfig(null)} className="btn-secondary" disabled={loading}>
                Cancel
              </button>
              <button
                onClick={handlePromptAction}
                className="btn-primary"
                disabled={loading || !promptValue.trim()}
              >
                {loading ? 'Saving...' : promptConfig.confirmText || 'Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
