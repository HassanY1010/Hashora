import React, { useEffect, useState } from 'react';
import { apiClient } from '../api/client';
import { useLanguage } from '../context/LanguageContext';
import { X, Copy, Check, QrCode, AlertTriangle, Send } from 'lucide-react';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const DepositModal: React.FC<DepositModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { t } = useLanguage();
  const [depositInfo, setDepositInfo] = useState<{ address: string; qrCodeUrl: string; instructions: string[] } | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [amount, setAmount] = useState<string>('100');
  const [txHash, setTxHash] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      apiClient.get('/api/deposits/address').then((res) => {
        setDepositInfo(res.data);
      }).catch((err) => {
        setError(err.message);
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Helper to normalize Arabic digits to English digits
  const normalizeDigits = (str: string) => {
    return str.replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString());
  };

  const handleCopy = () => {
    if (depositInfo?.address) {
      navigator.clipboard.writeText(depositInfo.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleSubmitTxHash = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    const normalizedAmountStr = normalizeDigits(amount);
    const parsedAmount = parseFloat(normalizedAmountStr) || 0;

    if (parsedAmount <= 0) {
      setError('Please enter a valid deposit amount.');
      setLoading(false);
      return;
    }

    try {
      await apiClient.post('/api/deposits/create', {
        amount: parsedAmount,
        txHash: txHash.trim() || undefined,
      });
      setSuccessMsg('Deposit request submitted! Once 20 TRON block confirmations pass, your balance will be credited.');
      setTxHash('');
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
            <div style={{ background: 'rgba(16, 185, 129, 0.15)', padding: '8px', borderRadius: '10px' }}>
              <QrCode size={20} color="#10b981" />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{t('depositHeader')}</h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', padding: '12px 16px', borderRadius: '10px', fontSize: '0.9rem', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        {successMsg && (
          <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#34d399', padding: '12px 16px', borderRadius: '10px', fontSize: '0.9rem', marginBottom: '16px' }}>
            {successMsg}
          </div>
        )}

        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          {depositInfo?.qrCodeUrl ? (
            <img src={depositInfo.qrCodeUrl} alt="TRC20 QR Code" style={{ width: '160px', height: '160px', borderRadius: '12px', border: '1px solid var(--glass-border-hover)' }} />
          ) : (
            <div style={{ width: '160px', height: '160px', margin: '0 auto', background: 'rgba(30,41,59,0.5)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading QR...</div>
          )}
        </div>

        <div className="input-group">
          <label className="input-label">{t('receiverAddress')}</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input className="input-field" value={depositInfo?.address || ''} readOnly style={{ flex: 1, fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }} />
            <button onClick={handleCopy} className="btn-secondary" style={{ padding: '0 16px' }}>
              {copied ? <Check size={18} color="#10b981" /> : <Copy size={18} />}
            </button>
          </div>
        </div>

        <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.25)', padding: '12px 16px', borderRadius: '12px', display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <AlertTriangle size={20} color="#fbbf24" style={{ flexShrink: 0 }} />
          <p style={{ fontSize: '0.8rem', color: '#fbbf24', lineHeight: '1.4' }}>
            {t('importantNotice')}
          </p>
        </div>

        <form onSubmit={handleSubmitTxHash}>
          <div className="input-group">
            <label className="input-label">Deposit Amount (USDT)</label>
            <input type="text" className="input-field" placeholder="e.g. 100" value={amount} onChange={(e) => setAmount(e.target.value)} required />
          </div>

          <div className="input-group">
            <label className="input-label">{t('txHashLabel')}</label>
            <input type="text" className="input-field" placeholder="e.g. 8a7f9b..." value={txHash} onChange={(e) => setTxHash(e.target.value)} />
          </div>

          <button type="submit" className="btn-success" disabled={loading} style={{ width: '100%', padding: '14px', marginTop: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
            <Send size={18} />
            {loading ? t('processingBtn') : t('submitDeposit')}
          </button>
        </form>
      </div>
    </div>
  );
};
