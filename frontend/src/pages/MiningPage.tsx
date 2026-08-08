import React, { useEffect, useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { apiClient } from '../api/client';
import { LiveMiningCounter } from '../components/LiveMiningCounter';
import { useLanguage } from '../context/LanguageContext';
import { Activity } from 'lucide-react';

export const MiningPage: React.FC = () => {
  const { t } = useLanguage();
  const [summary, setSummary] = useState<any>({ totalHashrate: 0, miningStatus: 'PAUSED' });
  const [chartData, setChartData] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    fetchMiningData();
  }, []);

  const fetchMiningData = async () => {
    try {
      const [sumRes, chartRes, histRes] = await Promise.all([
        apiClient.get('/api/contracts/my-summary'),
        apiClient.get('/api/mining/chart'),
        apiClient.get('/api/mining/history'),
      ]);
      setSummary(sumRes.data);
      setChartData(chartRes.data);
      setHistory(histRes.data.data);
    } catch (err) {
      console.error('Failed to load mining data:', err);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />

      <main style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>{t('miningPerformanceLogs')}</h1>
          <p style={{ color: 'var(--text-muted)' }}>{t('miningPerfDesc')}</p>
        </div>

        {/* Live Real-time Mining Counter */}
        <div style={{ marginBottom: '28px' }}>
          <LiveMiningCounter
            totalHashrate={summary.totalHashrate}
            miningStatus={summary.miningStatus}
            baseEarnings={0.0}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
          <div className="glass-card" style={{ padding: '24px' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>{t('activeMiningPower')}</span>
            <span style={{ display: 'block', fontSize: '2rem', fontWeight: 800, color: '#38bdf8', marginTop: '6px' }}>{summary.totalHashrate} MH/s</span>
          </div>

          <div className="glass-card" style={{ padding: '24px' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>{t('miningStatus')}</span>
            <div style={{ marginTop: '10px' }}>
              <span className={`badge ${summary.miningStatus === 'RUNNING' ? 'badge-active' : 'badge-suspended'}`}>
                {summary.miningStatus === 'RUNNING' ? t('miningRunning') : t('miningPaused')}
              </span>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="glass-card" style={{ padding: '28px', marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{t('dailyChart30')}</h3>
            <Activity size={20} color="#38bdf8" />
          </div>

          <div style={{ height: '220px', display: 'flex', alignItems: 'flex-end', gap: '6px', paddingTop: '20px' }}>
            {chartData.map((d: any, idx: number) => {
              const maxAmount = Math.max(...chartData.map((cd) => cd.amount), 1);
              const heightPercent = Math.max(10, (d.amount / maxAmount) * 100);
              return (
                <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                  <div
                    style={{
                      width: '100%',
                      height: `${heightPercent}%`,
                      background: 'linear-gradient(180deg, #10b981 0%, rgba(16, 185, 129, 0.2) 100%)',
                      borderRadius: '4px 4px 0 0',
                    }}
                    title={`${d.date}: ${d.amount} USDT`}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* History Table */}
        <div className="glass-card" style={{ padding: '28px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '20px' }}>{t('hourlyYieldLogs')}</h3>

          <div className="custom-table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>{t('dateTime')}</th>
                  <th>{t('contractCode')}</th>
                  <th>{t('planName')}</th>
                  <th>{t('miningHashrate')}</th>
                  <th>{t('earnedReward')}</th>
                </tr>
              </thead>
              <tbody>
                {history.length > 0 ? (
                  history.map((log: any) => (
                    <tr key={log.id}>
                      <td>{new Date(log.createdAt).toLocaleString()}</td>
                      <td style={{ fontFamily: 'var(--font-mono)' }}>{log.contract?.contractCode || 'MC-ACTIVE'}</td>
                      <td>{log.contract?.planName || 'Pro Plan'}</td>
                      <td>{log.hashrate} MH/s</td>
                      <td style={{ color: '#34d399', fontWeight: 700 }}>+{parseFloat(Number(log.amount).toFixed(6))} USDT</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '30px' }}>
                      {t('noMiningLogs')}
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
