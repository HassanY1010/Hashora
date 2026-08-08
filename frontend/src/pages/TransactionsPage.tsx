import React, { useEffect, useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { apiClient } from '../api/client';
import { useLanguage } from '../context/LanguageContext';

export const TransactionsPage: React.FC = () => {
  const { t } = useLanguage();
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    fetchTx();
  }, []);

  const fetchTx = async () => {
    try {
      const res = await apiClient.get('/api/transactions');
      setTransactions(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />

      <main style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>{t('transactions')}</h1>
          <p style={{ color: 'var(--text-muted)' }}>{t('masterLedger')}</p>
        </div>

        <div className="glass-card" style={{ padding: '28px' }}>
          <div className="custom-table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>{t('contractCode')}</th>
                  <th>{t('txType')}</th>
                  <th>{t('amount')}</th>
                  <th>{t('description')}</th>
                  <th>{t('dateTime')}</th>
                  <th>{t('status')}</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length > 0 ? (
                  transactions.map((tx: any) => (
                    <tr key={tx.id}>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>{tx.id.slice(0, 8)}...</td>
                      <td style={{ fontWeight: 600 }}>{tx.type}</td>
                      <td style={{ color: Number(tx.amount) >= 0 ? '#34d399' : '#f87171', fontWeight: 700 }}>
                        {Number(tx.amount) >= 0 ? '+' : ''}{tx.amount} USDT
                      </td>
                      <td style={{ color: 'var(--text-muted)' }}>{tx.description || '-'}</td>
                      <td>{new Date(tx.createdAt).toLocaleString()}</td>
                      <td>
                        <span className={`badge ${tx.status === 'COMPLETED' ? 'badge-completed' : tx.status === 'PENDING' ? 'badge-pending' : 'badge-failed'}`}>
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '30px' }}>
                      {t('noTransactions')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};
