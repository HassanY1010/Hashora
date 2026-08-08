import React, { useEffect, useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { apiClient } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import { ArrowDownLeft, Copy, Check, Info } from 'lucide-react';

export const DepositPage: React.FC = () => {
  const { refreshUser } = useAuth();
  const { showToast } = useToast();
  const { t } = useLanguage();
  const [depositAddress, setDepositAddress] = useState<string>('');
  const [txHash, setTxHash] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    fetchDepositAddress();
  }, []);

  const fetchDepositAddress = async () => {
    try {
      const res = await apiClient.get('/api/deposits/address');
      setDepositAddress(res.data.address);
    } catch (err) {
      console.error('Failed to load deposit address:', err);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(depositAddress);
    setCopied(true);
    showToast(t('copiedMsg'), 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSubmitDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!txHash.trim()) {
      showToast('Please enter transaction hash (TXID)', 'warning');
      return;
    }

    setLoading(true);

    try {
      await apiClient.post('/api/deposits/submit', {
        txHash: txHash.trim(),
      });
      showToast('Deposit submitted for verification!', 'success');
      setTxHash('');
      await refreshUser();
    } catch (err: any) {
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
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>{t('depositHeader')}</h1>
          <p style={{ color: 'var(--text-muted)' }}>{t('depositSub')}</p>
        </div>

        <div style={{ maxWidth: '640px' }}>
          <div className="glass-card" style={{ padding: '32px' }}>
            <div style={{ marginBottom: '24px' }}>
              <label className="input-label">{t('receiverAddress')}</label>
              <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                <input
                  type="text"
                  className="input-field"
                  value={depositAddress}
                  readOnly
                  style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', color: '#34d399' }}
                />
                <button onClick={handleCopy} className="btn-primary" style={{ padding: '0 20px', flexShrink: 0 }}>
                  {copied ? <Check size={18} /> : <Copy size={18} />}
                  {copied ? t('copiedMsg') : t('copyAddress')}
                </button>
              </div>
            </div>

            <div style={{ background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.3)', padding: '14px 18px', borderRadius: '12px', marginBottom: '28px', color: '#38bdf8', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Info size={20} style={{ flexShrink: 0 }} />
              <span>{t('importantNotice')}</span>
            </div>

            <form onSubmit={handleSubmitDeposit}>
              <div className="input-group">
                <label className="input-label">{t('txHashLabel')}</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. 8f92a10b4c7... (64 hex characters)"
                  value={txHash}
                  onChange={(e) => setTxHash(e.target.value)}
                  required
                  style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}
                />
              </div>

              <button type="submit" className="btn-success" disabled={loading} style={{ width: '100%', padding: '14px', justifyContent: 'center' }}>
                <ArrowDownLeft size={20} />
                {loading ? t('processingBtn') : t('submitDeposit')}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};
