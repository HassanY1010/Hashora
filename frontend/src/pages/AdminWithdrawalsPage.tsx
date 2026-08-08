import React, { useEffect, useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { apiClient } from '../api/client';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import { Check, X } from 'lucide-react';

export const AdminWithdrawalsPage: React.FC = () => {
  const { t } = useLanguage();
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const { showToast, showPrompt } = useToast();

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const fetchWithdrawals = async () => {
    try {
      const res = await apiClient.get('/api/withdraw/admin/all');
      setWithdrawals(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleApprove = (id: string) => {
    showPrompt({
      title: t('approvePayout'),
      message: 'Enter TRON Blockchain Payout TXID hash sent to user destination address:',
      placeholder: 'e.g. 9a8b7c6d5e4f3a...',
      confirmText: t('approvePayout'),
      onConfirm: async (txHash: string) => {
        try {
          await apiClient.put(`/api/withdraw/admin/${id}/approve`, { txHash });
          showToast('Withdrawal payout successfully approved!', 'success');
          fetchWithdrawals();
        } catch (err: any) {
          showToast(err.message, 'error');
        }
      },
    });
  };

  const handleReject = (id: string) => {
    showPrompt({
      title: t('rejectPayout'),
      message: t('enterRejectionReason'),
      placeholder: 'Rejection reason...',
      confirmText: t('rejectPayout'),
      onConfirm: async (reason: string) => {
        try {
          await apiClient.put(`/api/withdraw/admin/${id}/reject`, { reason });
          showToast('Withdrawal rejected and funds refunded to user available balance.', 'info');
          fetchWithdrawals();
        } catch (err: any) {
          showToast(err.message, 'error');
        }
      },
    });
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />

      <main style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>{t('withdrawalRequests')}</h1>
          <p style={{ color: 'var(--text-muted)' }}>{t('withdrawalRequestsSub')}</p>
        </div>

        <div className="glass-card" style={{ padding: '28px' }}>
          <div className="custom-table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>{t('userText')}</th>
                  <th>{t('amount')} (Net)</th>
                  <th>{t('destinationAddressLabel')}</th>
                  <th>Payout TXID</th>
                  <th>{t('status')}</th>
                  <th>{t('actions')}</th>
                </tr>
              </thead>
              <tbody>
                {withdrawals.map((w) => (
                  <tr key={w.id}>
                    <td style={{ fontWeight: 600 }}>{w.user?.fullName} ({w.user?.email})</td>
                    <td style={{ color: '#fbbf24', fontWeight: 700 }}>{w.amount} USDT (Net: {w.netAmount})</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>{w.walletAddress}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>{w.txHash || 'Pending'}</td>
                    <td>
                      <span className={`badge ${w.status === 'COMPLETED' ? 'badge-completed' : w.status === 'PENDING' ? 'badge-pending' : 'badge-failed'}`}>
                        {w.status}
                      </span>
                    </td>
                    <td>
                      {w.status === 'PENDING' && (
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button onClick={() => handleApprove(w.id)} className="btn-success" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                            <Check size={14} /> {t('approvePayout')}
                          </button>
                          <button onClick={() => handleReject(w.id)} className="btn-danger" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                            <X size={14} /> {t('rejectPayout')}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};
