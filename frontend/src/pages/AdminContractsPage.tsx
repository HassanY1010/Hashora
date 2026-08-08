import React, { useEffect, useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { apiClient } from '../api/client';
import { useLanguage } from '../context/LanguageContext';
import { PauseCircle, PlayCircle, XCircle } from 'lucide-react';

export const AdminContractsPage: React.FC = () => {
  const { t } = useLanguage();
  const [contracts, setContracts] = useState<any[]>([]);

  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    try {
      const res = await apiClient.get('/api/contracts/admin/all');
      setContracts(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    if (!window.confirm(`Set contract status to ${status}?`)) return;
    try {
      await apiClient.put(`/api/contracts/admin/${id}/status`, { status });
      fetchContracts();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />

      <main style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>{t('contractManagement')}</h1>
          <p style={{ color: 'var(--text-muted)' }}>{t('contractManagementSub')}</p>
        </div>

        <div className="glass-card" style={{ padding: '28px' }}>
          <div className="custom-table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>{t('contractCode')}</th>
                  <th>{t('userText')}</th>
                  <th>{t('planName')}</th>
                  <th>{t('miningHashrate')}</th>
                  <th>{t('totalEarnings')}</th>
                  <th>{t('status')}</th>
                  <th>{t('actions')}</th>
                </tr>
              </thead>
              <tbody>
                {contracts.map((c) => (
                  <tr key={c.id}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{c.contractCode}</td>
                    <td>{c.user?.fullName}</td>
                    <td>{c.planName}</td>
                    <td>{c.hashrate} MH/s</td>
                    <td style={{ color: '#34d399', fontWeight: 700 }}>{c.totalEarned} USDT</td>
                    <td>
                      <span className={`badge ${c.status === 'ACTIVE' ? 'badge-active' : c.status === 'SUSPENDED' ? 'badge-pending' : 'badge-failed'}`}>
                        {c.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {c.status === 'ACTIVE' ? (
                          <button onClick={() => handleUpdateStatus(c.id, 'SUSPENDED')} className="btn-secondary" style={{ padding: '6px 10px', fontSize: '0.8rem' }}>
                            <PauseCircle size={14} color="#f59e0b" /> Suspend
                          </button>
                        ) : (
                          <button onClick={() => handleUpdateStatus(c.id, 'ACTIVE')} className="btn-success" style={{ padding: '6px 10px', fontSize: '0.8rem' }}>
                            <PlayCircle size={14} /> Resume
                          </button>
                        )}
                        <button onClick={() => handleUpdateStatus(c.id, 'EXPIRED')} className="btn-danger" style={{ padding: '6px 10px', fontSize: '0.8rem' }}>
                          <XCircle size={14} /> Terminate
                        </button>
                      </div>
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
