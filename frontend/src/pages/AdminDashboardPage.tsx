import React, { useEffect, useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { apiClient } from '../api/client';
import { useLanguage } from '../context/LanguageContext';
import { Users, Cpu, ArrowDownLeft, ArrowUpRight, Award, Zap, RefreshCw } from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const { t } = useLanguage();
  const [stats, setStats] = useState<any>({
    totalUsers: 0,
    activeContracts: 0,
    totalDeposits: 0,
    totalWithdrawals: 0,
    totalPaidRewards: 0,
    totalHashrateMhs: 0,
    recentActivity: [],
  });

  const [loadingCycle, setLoadingCycle] = useState(false);
  const [cycleMsg, setCycleMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchAdminStats();
  }, []);

  const fetchAdminStats = async () => {
    try {
      const res = await apiClient.get('/api/admin/dashboard-stats');
      setStats(res.data);
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    }
  };

  const handleRunRewardCycle = async () => {
    setLoadingCycle(true);
    setCycleMsg(null);
    try {
      const res = await apiClient.post('/api/mining/admin/run-distribution');
      setCycleMsg(`Reward distribution completed! Processed ${res.data.processedCount} contracts, distributed ${res.data.totalAmountDistributed} USDT.`);
      fetchAdminStats();
    } catch (err: any) {
      setCycleMsg(`Error running reward cycle: ${err.message}`);
    } finally {
      setLoadingCycle(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />

      <main style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>{t('adminOverviewTitle')}</h1>
            <p style={{ color: '#fbbf24', fontSize: '0.9rem', fontWeight: 600 }}>{t('adminOverviewSub')}</p>
          </div>

          <button onClick={handleRunRewardCycle} disabled={loadingCycle} className="btn-primary" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
            <RefreshCw size={18} className={loadingCycle ? 'spin' : ''} />
            {loadingCycle ? t('runningYieldEngine') : t('runRewardCycle')}
          </button>
        </div>

        {cycleMsg && (
          <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#34d399', padding: '14px 18px', borderRadius: '12px', fontSize: '0.9rem', marginBottom: '24px' }}>
            {cycleMsg}
          </div>
        )}

        {/* 6 Core Admin Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '32px' }}>
          {/* Total Users */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>{t('registeredUsers')}</span>
              <Users size={20} color="#38bdf8" />
            </div>
            <span style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff' }}>{stats.totalUsers.toLocaleString()}</span>
          </div>

          {/* Active Contracts */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>{t('activeContracts')}</span>
              <Cpu size={20} color="#10b981" />
            </div>
            <span style={{ fontSize: '2rem', fontWeight: 800, color: '#34d399' }}>{stats.activeContracts.toLocaleString()}</span>
          </div>

          {/* Total Deposits */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>{t('totalConfirmedDeposits')}</span>
              <ArrowDownLeft size={20} color="#38bdf8" />
            </div>
            <span style={{ fontSize: '2rem', fontWeight: 800, color: '#38bdf8' }}>{stats.totalDeposits.toLocaleString()} USDT</span>
          </div>

          {/* Total Withdrawals */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>{t('totalCompletedWithdrawals')}</span>
              <ArrowUpRight size={20} color="#fbbf24" />
            </div>
            <span style={{ fontSize: '2rem', fontWeight: 800, color: '#fbbf24' }}>{stats.totalWithdrawals.toLocaleString()} USDT</span>
          </div>

          {/* Total Mining Rewards */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>{t('totalRewardsDistributed')}</span>
              <Award size={20} color="#818cf8" />
            </div>
            <span style={{ fontSize: '2rem', fontWeight: 800, color: '#818cf8' }}>{stats.totalPaidRewards.toLocaleString()} USDT</span>
          </div>

          {/* Current Total Hashrate */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>{t('totalPlatformHashrate')}</span>
              <Zap size={20} color="#f59e0b" />
            </div>
            <span style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff' }}>{(stats.totalHashrateMhs / 1000).toFixed(1)} TH/s</span>
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div className="glass-card" style={{ padding: '28px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '20px' }}>{t('recentActivityFeed')}</h3>

          <div className="custom-table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>{t('userText')}</th>
                  <th>{t('activityType')}</th>
                  <th>{t('amount')}</th>
                  <th>{t('description')}</th>
                  <th>{t('timeText')}</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentActivity.length > 0 ? (
                  stats.recentActivity.map((act: any) => (
                    <tr key={act.id}>
                      <td style={{ fontWeight: 600 }}>{act.user?.fullName || 'User'}</td>
                      <td>
                        <span className={`badge ${act.type === 'DEPOSIT' ? 'badge-confirmed' : act.type === 'WITHDRAWAL' ? 'badge-pending' : 'badge-active'}`}>
                          {act.type}
                        </span>
                      </td>
                      <td style={{ color: Number(act.amount) >= 0 ? '#34d399' : '#f87171', fontWeight: 700 }}>
                        {Number(act.amount) >= 0 ? '+' : ''}{act.amount} USDT
                      </td>
                      <td style={{ color: 'var(--text-muted)' }}>{act.description || '-'}</td>
                      <td>{new Date(act.createdAt).toLocaleString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '30px' }}>
                      No recent activity records.
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
