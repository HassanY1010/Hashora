import React, { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { apiClient } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import { ShieldAlert, CheckCircle2, AlertTriangle, Wallet } from 'lucide-react';

export const WithdrawPage: React.FC = () => {
  const { wallet, refreshUser } = useAuth();
  const { showToast } = useToast();
  const { t } = useLanguage();
  const [amount, setAmount] = useState<string>('5');
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

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
      showToast(`Insufficient available balance. Minimum withdrawal is ${minThreshold} USDT.`, 'warning');
      return;
    }

    if (numAmount < minThreshold) {
      setError(`Minimum withdrawal threshold is ${minThreshold} USDT.`);
      showToast(`Minimum withdrawal threshold is ${minThreshold} USDT.`, 'warning');
      return;
    }

    if (numAmount > availableBalance) {
      setError(`Insufficient available balance. You requested ${numAmount} USDT, but your balance is only ${availableBalance} USDT.`);
      showToast(`Requested amount (${numAmount} USDT) exceeds available balance.`, 'error');
      return;
    }

    if (!/^T[a-zA-Z0-9]{33}$/.test(walletAddress.trim())) {
      setError('Invalid TRON wallet address. Address must start with "T" and be 34 characters long.');
      showToast('Invalid TRON wallet address format.', 'error');
      return;
    }

    setLoading(true);

    try {
      await apiClient.post('/api/withdraw/create', {
        amount: numAmount,
        walletAddress: walletAddress.trim(),
      });
      setSuccessMsg('Withdrawal request submitted! It is now pending admin approval & payout execution.');
      showToast('Withdrawal request submitted successfully!', 'success');
      await refreshUser();
    } catch (err: any) {
      setError(err.message);
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />

      <main style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>{t('withdrawHeader')}</h1>
          <p style={{ color: 'var(--text-muted)' }}>{t('withdrawSub')}</p>
        </div>

        <div style={{ maxWidth: '640px' }}>
          <div className="glass-card" style={{ padding: '32px' }}>
            <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--glass-border)', padding: '16px 20px', borderRadius: '14px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Wallet size={20} color="#34d399" />
                <span style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>{t('availableBalance')}:</span>
              </div>
              <span style={{ fontWeight: 800, fontSize: '1.3rem', color: availableBalance >= minThreshold ? '#34d399' : '#f59e0b' }}>
                {availableBalance} USDT
              </span>
            </div>

            {isBalanceInsufficient && (
              <div style={{ background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.3)', color: '#fbbf24', padding: '14px 18px', borderRadius: '12px', fontSize: '0.9rem', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <AlertTriangle size={20} style={{ flexShrink: 0 }} />
                <span>Your available balance is <strong>{availableBalance} USDT</strong>. You need at least <strong>5 USDT</strong> to submit a payout request.</span>
              </div>
            )}

            {error && (
              <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', padding: '14px 18px', borderRadius: '12px', fontSize: '0.9rem', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ShieldAlert size={20} style={{ flexShrink: 0 }} />
                {error}
              </div>
            )}

            {successMsg && (
              <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#34d399', padding: '14px 18px', borderRadius: '12px', fontSize: '0.9rem', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CheckCircle2 size={20} style={{ flexShrink: 0 }} />
                {successMsg}
              </div>
            )}

            <form onSubmit={handleWithdrawSubmit}>
              <div className="input-group">
                <label className="input-label">{t('destinationAddressLabel')}</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. TXYZ1234567890abcdefghijklmnopqrst"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  required
                  style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem' }}
                />
              </div>

              <div className="input-group">
                <label className="input-label">{t('withdrawAmountLabel')}</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Min 5 USDT"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>

              <div style={{ background: 'rgba(30, 41, 59, 0.4)', borderRadius: '12px', padding: '16px', marginBottom: '24px', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                  <span>{t('flatNetworkFee')}:</span>
                  <span>1.00 USDT</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: '#ffffff', borderTop: '1px solid var(--glass-border)', paddingTop: '8px' }}>
                  <span>{t('youWillReceive')}:</span>
                  <span style={{ color: netReceive > 0 ? '#38bdf8' : 'var(--text-muted)', fontSize: '1.05rem' }}>
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
                {loading ? t('processingBtn') : isBalanceInsufficient ? t('insufficientBalance') : t('submitWithdrawalReq')}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};
