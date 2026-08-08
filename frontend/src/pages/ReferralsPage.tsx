import React, { useEffect, useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { apiClient } from '../api/client';
import { useLanguage } from '../context/LanguageContext';
import { Users, Copy, Check, Award, UserCheck, Share2 } from 'lucide-react';

export const ReferralsPage: React.FC = () => {
  const { t } = useLanguage();
  const [data, setData] = useState<any>({
    referralCode: '',
    referralLink: '',
    totalReferrals: 0,
    activeReferrals: 0,
    totalCommission: 0,
    commissionLogs: [],
  });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchReferrals();
  }, []);

  const fetchReferrals = async () => {
    try {
      const res = await apiClient.get('/api/referrals');
      setData(res.data);
    } catch (err) {
      console.error('Failed to fetch referrals:', err);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(data.referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />

      <main style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>{t('referralHeader')}</h1>
          <p style={{ color: 'var(--text-muted)' }}>{t('referralSub')}</p>
        </div>

        {/* Link Share Card */}
        <div className="glass-card" style={{ padding: '32px', marginBottom: '32px', background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.15), rgba(15, 23, 42, 0.8))' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <Share2 size={24} color="#38bdf8" />
            <h3 style={{ fontSize: '1.3rem', fontWeight: 700 }}>{t('uniqueLink')}</h3>
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <input
              type="text"
              className="input-field"
              value={data.referralLink}
              readOnly
              style={{ flex: 1, minWidth: '280px', fontFamily: 'var(--font-mono)', fontSize: '0.95rem' }}
            />
            <button onClick={handleCopy} className="btn-primary" style={{ padding: '0 24px' }}>
              {copied ? <Check size={18} color="#ffffff" /> : <Copy size={18} />}
              {copied ? t('linkCopied') : t('copyLink')}
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '32px' }}>
          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>{t('totalReferrals')}</span>
              <Users size={20} color="#38bdf8" />
            </div>
            <span style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff' }}>{data.totalReferrals}</span>
          </div>

          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>{t('activeMiners')}</span>
              <UserCheck size={20} color="#10b981" />
            </div>
            <span style={{ fontSize: '2rem', fontWeight: 800, color: '#34d399' }}>{data.activeReferrals}</span>
          </div>

          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>{t('totalEarnedCommission')}</span>
              <Award size={20} color="#fbbf24" />
            </div>
            <span style={{ fontSize: '2rem', fontWeight: 800, color: '#fbbf24' }}>{data.totalCommission} USDT</span>
          </div>
        </div>

        {/* 3-Tier Explanation */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '32px' }}>
          <div className="glass-card" style={{ padding: '24px' }}>
            <span className="badge badge-active" style={{ marginBottom: '10px' }}>{t('level1Direct')}</span>
            <h4 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#38bdf8', margin: '4px 0' }}>5% Commission</h4>
          </div>

          <div className="glass-card" style={{ padding: '24px' }}>
            <span className="badge badge-pending" style={{ marginBottom: '10px' }}>{t('level2Indirect')}</span>
            <h4 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fbbf24', margin: '4px 0' }}>3% Commission</h4>
          </div>

          <div className="glass-card" style={{ padding: '24px' }}>
            <span className="badge badge-completed" style={{ marginBottom: '10px' }}>{t('level3Sub')}</span>
            <h4 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#34d399', margin: '4px 0' }}>1% Commission</h4>
          </div>
        </div>

        {/* Commission History Table */}
        <div className="glass-card" style={{ padding: '28px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '20px' }}>{t('payoutHistory')}</h3>

          <div className="custom-table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>{t('referredUser')}</th>
                  <th>{t('tierLevel')}</th>
                  <th>{t('planPurchased')}</th>
                  <th>{t('commissionEarned')}</th>
                  <th>{t('dateTime')}</th>
                </tr>
              </thead>
              <tbody>
                {data.commissionLogs.length > 0 ? (
                  data.commissionLogs.map((log: any) => (
                    <tr key={log.id}>
                      <td style={{ fontWeight: 600 }}>{log.referredUserMaskedName}</td>
                      <td>
                        <span className={`badge ${log.level === 1 ? 'badge-active' : log.level === 2 ? 'badge-pending' : 'badge-completed'}`}>
                          Level {log.level}
                        </span>
                      </td>
                      <td>{log.planName}</td>
                      <td style={{ color: '#fbbf24', fontWeight: 700 }}>+{log.commissionAmount} USDT</td>
                      <td>{new Date(log.createdAt).toLocaleString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '30px' }}>
                      {t('noReferrals')}
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
