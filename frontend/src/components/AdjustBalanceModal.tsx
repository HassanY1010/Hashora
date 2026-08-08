import React, { useState } from 'react';
import { apiClient } from '../api/client';
import { X, DollarSign, ShieldAlert } from 'lucide-react';

interface AdjustBalanceModalProps {
  isOpen: boolean;
  userId: string | null;
  userName: string | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdjustBalanceModal: React.FC<AdjustBalanceModalProps> = ({
  isOpen,
  userId,
  userName,
  onClose,
  onSuccess,
}) => {
  const [amount, setAmount] = useState<string>('50');
  const [reason, setReason] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !userId) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!reason || reason.trim().length < 5) {
      setError('Reason must be at least 5 characters long for audit records.');
      return;
    }

    setLoading(true);

    try {
      await apiClient.put(`/api/users/admin/${userId}/balance`, {
        amount: parseFloat(amount),
        reason: reason.trim(),
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: 'rgba(245, 158, 11, 0.15)', padding: '8px', borderRadius: '10px' }}>
              <DollarSign size={20} color="#fbbf24" />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Adjust User Balance</h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
          Target Account: <strong style={{ color: '#fff' }}>{userName}</strong>
        </p>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', padding: '12px 16px', borderRadius: '10px', fontSize: '0.9rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldAlert size={18} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label">Adjustment Amount (Use positive to add, negative to deduct)</label>
            <input
              type="number"
              step="any"
              className="input-field"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label className="input-label">Mandatory Reason (Recorded in Immutable Audit Log)</label>
            <textarea
              className="input-field"
              rows={3}
              placeholder="e.g. Manual correction for missed TRC20 transfer..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', padding: '14px', justifyContent: 'center', background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
            {loading ? 'Executing Adjustment...' : 'Confirm Balance Override'}
          </button>
        </form>
      </div>
    </div>
  );
};
