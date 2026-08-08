import React, { useState } from 'react';
import { apiClient } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { X, ArrowUpRight, ShieldAlert, CheckCircle2, AlertTriangle } from 'lucide-react';

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const WithdrawModal: React.FC<WithdrawModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { wallet, refreshUser } = useAuth();
  const [amount, setAmount] = useState<string>('5');
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  // Helper to normalize Arabic digits to English digits
  const normalizeDigits = (str: string) => {
    return str.replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString());
  };

  const normalizedAmountStr = normalizeDigits(amount);
  const numAmount = parseFloat(normalizedAmountStr) || 0;
  const fee = 1.0; // Flat TRC20 network fee
  const minThreshold = 5.0; // Minimum withdrawal threshold set to 5 USDT
  const availableBalance = wallet?.availableBalance || 0;
  const netReceive = numAmount > fee && numAmount <= availableBalance ? numAmount - fee : 0;

  const isBalanceInsufficient = availableBalance < minThreshold;
  const isAmountExceedingBalance = numAmount > availableBalance;
  const isAmountTooLow = numAmount > 0 && numAmount < minThreshold;

  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (availableBalance < minThreshold) {
      setError(`Insufficient available balance. Your balance is ${availableBalance} USDT, minimum withdrawal required is ${minThreshold} USDT.`);
      return;
    }

    if (numAmount < minThreshold) {
      setError(`Minimum withdrawal threshold is ${minThreshold} USDT.`);
      return;
    }

    if (numAmount > availableBalance) {
      setError(`Insufficient available balance. You requested ${numAmount} USDT, but your balance is only ${availableBalance} USDT.`);
      return;
    }

    if (!/^T[a-zA-Z0-9]{33}$/.test(walletAddress.trim())) {
      setError('Invalid TRON wallet address. Address must start with "T" and be 34 characters long.');
      return;
    }

    setLoading(true);

    try {
      await apiClient.post('/api/withdraw/create', {
        amount: numAmount,
        walletAddress: walletAddress.trim(),
      });
      setSuccessMsg('Withdrawal request submitted! It is now pending admin approval & payout execution.');
      await refreshUser();
      if (onSuccess) onSuccess();
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
            <div style={{ background: 'rgba(56, 189, 248, 0.15)', padding: '8px', borderRadius: '10px' }}>
              <ArrowUpRight size={20} color="#38bdf8" />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Request USDT Withdrawal</h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {isBalanceInsufficient && (
          <div style={{ background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.3)', color: '#fbbf24', padding: '12px 16px', borderRadius: '10px', fontSize: '0.85rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertTriangle size={18} style={{ flexShrink: 0 }} />
            <span>Your available balance is <strong>{availableBalance} USDT</strong>. You need at least <strong>5 USDT</strong> to request a withdrawal.</span>
          </div>
        )}

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', padding: '12px 16px', borderRadius: '10px', fontSize: '0.9rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldAlert size={18} />
            {error}
          </div>
        )}

        {successMsg && (
          <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#34d399', padding: '12px 16px', borderRadius: '10px', fontSize: '0.9rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={18} />
            {successMsg}
          </div>
        )}

        <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--glass-border)', padding: '14px 18px', borderRadius: '12px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Available Balance:</span>
          <span style={{ fontWeight: 800, fontSize: '1.2rem', color: availableBalance >= 5 ? '#34d399' : '#f59e0b' }}>
            {availableBalance} USDT
          </span>
        </div>

        <form onSubmit={handleWithdrawSubmit}>
          <div className="input-group">
            <label className="input-label">Destination TRC20 Address (starts with T)</label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. TXYZ1234567890abcdefghijklmnopqrst"
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              required
              style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}
            />
          </div>

          <div className="input-group">
            <label className="input-label">Withdrawal Amount (USDT)</label>
            <input
              type="text"
              className="input-field"
              placeholder="Min 5 USDT"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
            {isAmountExceedingBalance && (
              <span style={{ fontSize: '0.8rem', color: '#ef4444', marginTop: '4px' }}>
                ⚠️ Amount exceeds your available balance ({availableBalance} USDT).
              </span>
            )}
            {isAmountTooLow && (
              <span style={{ fontSize: '0.8rem', color: '#f59e0b', marginTop: '4px' }}>
                ⚠️ Minimum withdrawal amount is 5 USDT.
              </span>
            )}
          </div>

          <div style={{ background: 'rgba(30, 41, 59, 0.4)', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
              <span>Flat Network Fee:</span>
              <span>1.00 USDT</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: '#ffffff', borderTop: '1px solid var(--glass-border)', paddingTop: '6px' }}>
              <span>You Will Receive:</span>
              <span style={{ color: netReceive > 0 ? '#38bdf8' : 'var(--text-muted)' }}>
                {netReceive.toFixed(2)} USDT
              </span>
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={loading || isBalanceInsufficient || isAmountExceedingBalance || isAmountTooLow}
            style={{
              width: '100%',
              padding: '14px',
              justifyContent: 'center',
              opacity: loading || isBalanceInsufficient || isAmountExceedingBalance || isAmountTooLow ? 0.5 : 1,
              cursor: loading || isBalanceInsufficient || isAmountExceedingBalance || isAmountTooLow ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Processing Request...' : isBalanceInsufficient ? 'Insufficient Balance (Min 5 USDT)' : 'Submit Withdrawal Request'}
          </button>
        </form>
      </div>
    </div>
  );
};
