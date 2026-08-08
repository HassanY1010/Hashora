import React, { useEffect, useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { apiClient } from '../api/client';
import { DepositModal } from '../components/DepositModal';
import { WithdrawModal } from '../components/WithdrawModal';
import { LiveMiningCounter } from '../components/LiveMiningCounter';
import { SmartNotificationCenter } from '../components/SmartNotificationCenter';
import { 
  Zap, 
  Wallet as WalletIcon, 
  TrendingUp, 
  Award, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Activity
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user, wallet } = useAuth();
  const { t } = useLanguage();
  const [summary, setSummary] = useState<any>({
    totalHashrate: 0,
    activeContractsCount: 0,
    miningStatus: 'PAUSED',
  });
  const [todayEarnings, setTodayEarnings] = useState<number>(0);
  const [totalEarnings, setTotalEarnings] = useState<number>(0);
  const [chartData, setChartData] = useState<any[]>([]);

  const [isDepositOpen, setIsDepositOpen] = useState<boolean>(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState<boolean>(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [sumRes, chartRes] = await Promise.all([
        apiClient.get('/api/contracts/my-summary'),
        apiClient.get('/api/mining/chart'),
      ]);
      setSummary(sumRes.data);
      setChartData(chartRes.data);

      const todayStr = new Date().toISOString().split('T')[0];
      const todayEntry = chartRes.data.find((d: any) => d.date === todayStr);
      setTodayEarnings(todayEntry ? todayEntry.amount : 0.0);

      const totalSum = chartRes.data.reduce((acc: number, curr: any) => acc + curr.amount, 0);
      setTotalEarnings(totalSum);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />

      <main style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
        {/* Topbar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>{t('welcomeBack')}, {user?.fullName}! 👋</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>{t('overviewDesc')}</p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid var(--glass-border)', padding: '10px 18px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <WalletIcon size={18} color="#34d399" />
              <div>
                <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t('availableBalance')}</span>
                <span style={{ fontWeight: 800, color: '#34d399', fontSize: '1.1rem' }}>{wallet?.availableBalance || 0} USDT</span>
              </div>
            </div>

            {/* Smart Notification Center Bell Dropdown */}
            <SmartNotificationCenter />
          </div>
        </div>

        {/* PROMINENT LIVE REAL-TIME MINING TICKER COUNTER */}
        <div style={{ marginBottom: '28px' }}>
          <LiveMiningCounter
            totalHashrate={summary.totalHashrate}
            miningStatus={summary.miningStatus}
            baseEarnings={todayEarnings}
          />
        </div>

        {/* 5 Core Dashboard Overview Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '32px' }}>
          {/* Card 1: Total Hashrate */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>{t('totalHashrate')}</span>
              <div style={{ background: 'rgba(56, 189, 248, 0.15)', padding: '8px', borderRadius: '10px' }}>
                <Zap size={20} color="#38bdf8" />
              </div>
            </div>
            <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff' }}>{summary.totalHashrate} MH/s</span>
            <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-sub)', marginTop: '4px' }}>From {summary.activeContractsCount} active contracts</span>
          </div>

          {/* Card 2: Mining Status */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>{t('miningStatus')}</span>
              <div className={summary.miningStatus === 'RUNNING' ? 'pulse-dot' : ''} />
            </div>
            <span className={`badge ${summary.miningStatus === 'RUNNING' ? 'badge-active' : 'badge-suspended'}`} style={{ fontSize: '1rem', padding: '6px 14px' }}>
              {summary.miningStatus === 'RUNNING' ? t('miningRunning') : t('miningPaused')}
            </span>
          </div>

          {/* Card 3: Today's Earnings */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>{t('todaysEarnings')}</span>
              <div style={{ background: 'rgba(16, 185, 129, 0.15)', padding: '8px', borderRadius: '10px' }}>
                <TrendingUp size={20} color="#10b981" />
              </div>
            </div>
            <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#34d399' }}>+{todayEarnings.toFixed(4)} USDT</span>
          </div>

          {/* Card 4: Total Earnings */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>{t('totalEarnings')}</span>
              <div style={{ background: 'rgba(245, 158, 11, 0.15)', padding: '8px', borderRadius: '10px' }}>
                <Award size={20} color="#fbbf24" />
              </div>
            </div>
            <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fbbf24' }}>{totalEarnings.toFixed(2)} USDT</span>
          </div>

          {/* Card 5: Available Balance */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>{t('availableBalance')}</span>
              <div style={{ background: 'rgba(129, 140, 248, 0.15)', padding: '8px', borderRadius: '10px' }}>
                <WalletIcon size={20} color="#818cf8" />
              </div>
            </div>
            <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff' }}>{wallet?.availableBalance || 0} USDT</span>
            <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
              <button onClick={() => setIsDepositOpen(true)} className="btn-success" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>{t('deposit')}</button>
              <button onClick={() => setIsWithdrawOpen(true)} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>{t('withdrawBtn')}</button>
            </div>
          </div>
        </div>

        {/* Performance Chart & Quick Actions */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
          <div className="glass-card" style={{ padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{t('dailyChart30')}</h3>
              </div>
              <Activity size={20} color="#38bdf8" />
            </div>

            <div style={{ height: '220px', display: 'flex', alignItems: 'flex-end', gap: '8px', paddingTop: '20px' }}>
              {chartData.slice(-14).map((d: any, idx: number) => {
                const maxAmount = Math.max(...chartData.map((cd) => cd.amount), 1);
                const heightPercent = Math.max(12, (d.amount / maxAmount) * 100);
                return (
                  <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <div
                      style={{
                        width: '100%',
                        height: `${heightPercent}%`,
                        background: 'linear-gradient(180deg, #38bdf8 0%, rgba(56, 189, 248, 0.2) 100%)',
                        borderRadius: '6px 6px 0 0',
                        transition: 'all 0.3s ease',
                      }}
                      title={`${d.date}: ${d.amount} USDT`}
                    />
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-sub)' }}>{d.date.slice(8)}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="glass-card" style={{ padding: '28px', background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.2), rgba(15, 23, 42, 0.8))' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '10px' }}>{t('needMoreHashrate')}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>{t('upgradeDesc')}</p>
              <button onClick={() => window.location.href = '/plans'} className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                {t('explorePlans')}
              </button>
            </div>

            <div className="glass-card" style={{ padding: '24px' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '14px' }}>{t('quickActions')}</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button onClick={() => setIsDepositOpen(true)} className="btn-success" style={{ justifyContent: 'center', width: '100%' }}>
                  <ArrowDownLeft size={18} /> {t('depositBtn')}
                </button>
                <button onClick={() => setIsWithdrawOpen(true)} className="btn-secondary" style={{ justifyContent: 'center', width: '100%' }}>
                  <ArrowUpRight size={18} /> {t('withdrawBtn')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <DepositModal isOpen={isDepositOpen} onClose={() => setIsDepositOpen(false)} onSuccess={fetchDashboardData} />
      <WithdrawModal isOpen={isWithdrawOpen} onClose={() => setIsWithdrawOpen(false)} onSuccess={fetchDashboardData} />
    </div>
  );
};
