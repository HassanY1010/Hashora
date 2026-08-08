import React, { useEffect, useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { apiClient } from '../api/client';
import { DepositModal } from '../components/DepositModal';
import { WithdrawModal } from '../components/WithdrawModal';
import { Wallet as WalletIcon, ArrowDownLeft, ArrowUpRight, History, Clock } from 'lucide-react';

export const WalletPage: React.FC = () => {
  const { wallet, refreshUser } = useAuth();
  const { t } = useLanguage();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const res = await apiClient.get('/api/transactions');
      setTransactions(res.data.data);
    } catch (err) {
      console.error('Failed to load transactions:', err);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />

      <main style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>{t('internalWalletBalances')}</h1>
          <p style={{ color: 'var(--text-muted)' }}>{t('walletDesc')}</p>
        </div>

        {/* Balance Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '32px' }}>
          <div className="glass-card" style={{ padding: '24px', borderColor: 'var(--primary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>{t('availableBalance')}</span>
              <WalletIcon size={20} color="#38bdf8" />
            </div>
            <span style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff' }}>{wallet?.availableBalance || 0} USDT</span>
            <span style={{ display: 'block', fontSize: '0.8rem', color: '#34d399', marginTop: '4px' }}>{t('readyForWithdrawal')}</span>
          </div>

          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>{t('miningYieldEarnings')}</span>
              <History size={20} color="#34d399" />
            </div>
            <span style={{ fontSize: '2rem', fontWeight: 800, color: '#34d399' }}>{wallet?.miningBalance || 0} USDT</span>
            <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-sub)', marginTop: '4px' }}>{t('cumulativeOutput')}</span>
          </div>

          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>{t('pendingProcessing')}</span>
              <Clock size={20} color="#fbbf24" />
            </div>
            <span style={{ fontSize: '2rem', fontWeight: 800, color: '#fbbf24' }}>{wallet?.pendingBalance || 0} USDT</span>
            <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-sub)', marginTop: '4px' }}>{t('pendingApproval')}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
          <button onClick={() => setIsDepositOpen(true)} className="btn-success" style={{ padding: '14px 28px', fontSize: '1rem' }}>
            <ArrowDownLeft size={20} /> {t('depositBtn')}
          </button>
          <button onClick={() => setIsWithdrawOpen(true)} className="btn-primary" style={{ padding: '14px 28px', fontSize: '1rem' }}>
            <ArrowUpRight size={20} /> {t('withdrawBtn')}
          </button>
        </div>

        {/* Ledger Table */}
        <div className="glass-card" style={{ padding: '28px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '20px' }}>{t('masterLedger')}</h3>

          <div className="custom-table-container">
            <table className="custom-table">
              <thead>
                <tr>
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
                    <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '30px' }}>
                      {t('noTransactions')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <DepositModal isOpen={isDepositOpen} onClose={() => setIsDepositOpen(false)} onSuccess={() => { refreshUser(); fetchTransactions(); }} />
      <WithdrawModal isOpen={isWithdrawOpen} onClose={() => setIsWithdrawOpen(false)} onSuccess={() => { refreshUser(); fetchTransactions(); }} />
    </div>
  );
};
