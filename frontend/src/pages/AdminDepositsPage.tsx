import React, { useEffect, useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { apiClient } from '../api/client';
import { useToast } from '../context/ToastContext';
import { Check, X } from 'lucide-react';

export const AdminDepositsPage: React.FC = () => {
  const [deposits, setDeposits] = useState<any[]>([]);
  const { showToast, showConfirm, showPrompt } = useToast();

  useEffect(() => {
    fetchDeposits();
  }, []);

  const fetchDeposits = async () => {
    try {
      const res = await apiClient.get('/api/deposits/admin/all');
      setDeposits(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleConfirm = (id: string) => {
    showPrompt({
      title: 'Confirm Deposit Transaction',
      message: 'Enter TRC20 Transaction Hash (TXID) from TRON blockchain to credit user account:',
      placeholder: 'e.g. 7f8a9b0c1d2e3f...',
      confirmText: 'Confirm & Credit',
      onConfirm: async (txHash: string) => {
        try {
          await apiClient.put(`/api/deposits/admin/${id}/confirm`, { txHash });
          showToast('Deposit successfully confirmed and credited to user balance!', 'success');
          fetchDeposits();
        } catch (err: any) {
          showToast(err.message, 'error');
        }
      },
    });
  };

  const handleReject = (id: string) => {
    showConfirm({
      title: 'Reject Deposit Request',
      message: 'Are you sure you want to REJECT this deposit request?',
      variant: 'danger',
      confirmText: 'Reject Deposit',
      onConfirm: async () => {
        try {
          await apiClient.put(`/api/deposits/admin/${id}/reject`);
          showToast('Deposit request rejected.', 'info');
          fetchDeposits();
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
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>USDT Deposits Approval Queue</h1>
          <p style={{ color: 'var(--text-muted)' }}>Review incoming USDT TRC20 transfers, insert TXID hashes, and credit user accounts.</p>
        </div>

        <div className="glass-card" style={{ padding: '28px' }}>
          <div className="custom-table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Amount</th>
                  <th>TXID Hash</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {deposits.map((d) => (
                  <tr key={d.id}>
                    <td style={{ fontWeight: 600 }}>{d.user?.fullName} ({d.user?.email})</td>
                    <td style={{ color: '#34d399', fontWeight: 700 }}>+{d.amount} USDT</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>{d.txHash || 'Pending TXID'}</td>
                    <td>{new Date(d.createdAt).toLocaleString()}</td>
                    <td>
                      <span className={`badge ${d.status === 'CONFIRMED' ? 'badge-confirmed' : d.status === 'PENDING' ? 'badge-pending' : 'badge-failed'}`}>
                        {d.status}
                      </span>
                    </td>
                    <td>
                      {d.status === 'PENDING' && (
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button onClick={() => handleConfirm(d.id)} className="btn-success" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                            <Check size={14} /> Confirm Deposit
                          </button>
                          <button onClick={() => handleReject(d.id)} className="btn-danger" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                            <X size={14} /> Reject
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
