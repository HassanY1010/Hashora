import React, { useEffect, useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { apiClient } from '../api/client';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import { Gift } from 'lucide-react';

export const MyPlansPage: React.FC = () => {
  const { t, isRtl } = useLanguage();
  const [plans, setPlans] = useState<any[]>([]);
  const [userContracts, setUserContracts] = useState<any[]>([]);
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);
  const { showToast, showConfirm } = useToast();

  useEffect(() => {
    fetchPlans();
    fetchUserContracts();
  }, []);

  const fetchPlans = async () => {
    try {
      const res = await apiClient.get('/api/plans');
      setPlans(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUserContracts = async () => {
    try {
      const res = await apiClient.get('/api/contracts/user/my-contracts');
      setUserContracts(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const getTranslatedPlanName = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('free')) return t('freeTrial');
    if (lower.includes('starter')) return t('starterPlan');
    if (lower.includes('pro')) return t('proPlan');
    if (lower.includes('premium')) return t('premiumPlan');
    return name;
  };

  const hasClaimedFreeTrial = userContracts.some((c) => Number(c.pricePaid) === 0);

  const handlePurchase = (plan: any) => {
    const isFree = Number(plan.price) === 0;
    const planTranslatedName = getTranslatedPlanName(plan.name);

    if (isFree && hasClaimedFreeTrial) {
      showToast(t('alreadyClaimed'), 'warning');
      return;
    }

    showConfirm({
      title: isFree ? t('claimFree') : `${t('buyAction')}: ${planTranslatedName}`,
      message: isFree
        ? 'Are you sure you want to activate your Free Trial cloud mining contract (20 MH/s for 3 days)?'
        : `Are you sure you want to purchase ${planTranslatedName} for ${plan.price} USDT?`,
      confirmText: isFree ? t('claimFree') : t('buyAction'),
      onConfirm: async () => {
        setLoadingPlanId(plan.id);
        try {
          const res = await apiClient.post('/api/contracts/create', { planId: plan.id });
          showToast(res.data.message, 'success');
          fetchUserContracts();
        } catch (err: any) {
          showToast(err.message, 'error');
        } finally {
          setLoadingPlanId(null);
        }
      },
    });
  };

  const getExpectedYieldText = (price: number) => {
    if (price === 0) return '≈ 0.10 - 0.50 USDT';
    if (price === 5) return '≈ 6.00 - 7.00 USDT';
    if (price === 10) return '≈ 11.50 - 14.00 USDT';
    if (price === 20) return '≈ 24.00 - 30.00 USDT';
    return 'Dynamic Yield';
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />

      <main style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>{t('myPlans')}</h1>
          <p style={{ color: 'var(--text-muted)' }}>{t('chooseCapacity')}</p>
        </div>

        {/* Section 1: Catalog */}
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '20px' }}>{t('availablePlans')}</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px', marginBottom: '48px' }}>
          {plans.map((p) => {
            const isFree = Number(p.price) === 0;
            const isDisabled = isFree && hasClaimedFreeTrial;
            const planTranslatedName = getTranslatedPlanName(p.name);

            return (
              <div
                key={p.id}
                className="glass-card"
                style={{
                  padding: '28px',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  borderColor: isFree ? 'rgba(16, 185, 129, 0.4)' : p.price === 10 ? 'var(--primary)' : 'var(--glass-border)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <span className={`badge ${isFree ? 'badge-confirmed' : 'badge-active'}`}>
                    {isFree ? <Gift size={14} style={{ marginRight: '4px' }} /> : null}
                    {planTranslatedName}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    {p.durationDays} {t('daysText')}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '16px' }}>
                  <span style={{ fontSize: '2.4rem', fontWeight: 800, color: isFree ? '#34d399' : '#38bdf8' }}>{p.price}</span>
                  <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>USDT</span>
                </div>

                {/* Expected Yield Badge */}
                <div style={{ background: isFree ? 'rgba(16, 185, 129, 0.1)' : 'rgba(56, 189, 248, 0.1)', border: '1px dashed rgba(56, 189, 248, 0.3)', padding: '8px 12px', borderRadius: '8px', marginBottom: '16px' }}>
                  <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>{t('expectedYield')}</span>
                  <span style={{ fontSize: '0.95rem', fontWeight: 800, color: isFree ? '#34d399' : '#38bdf8' }}>
                    {getExpectedYieldText(p.price)}
                  </span>
                </div>

                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '24px', flex: 1 }}>{p.description}</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>{t('miningHashrate')}</span>
                    <span style={{ fontWeight: 700, color: '#fff' }}>{p.hashrate} MH/s</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>{t('contractDuration')}</span>
                    <span style={{ fontWeight: 700, color: '#fff' }}>{p.durationDays} {t('daysText')}</span>
                  </div>
                </div>

                <button
                  onClick={() => handlePurchase(p)}
                  disabled={loadingPlanId === p.id || isDisabled}
                  className={isFree ? 'btn-success' : 'btn-primary'}
                  style={{ width: '100%', justifyContent: 'center', opacity: isDisabled ? 0.6 : 1, cursor: isDisabled ? 'not-allowed' : 'pointer' }}
                >
                  {loadingPlanId === p.id
                    ? t('processing')
                    : isDisabled
                    ? t('alreadyClaimed')
                    : isFree
                    ? t('claimFree')
                    : `${t('buyAction')} ${planTranslatedName} (${p.price} USDT)`}
                </button>
              </div>
            );
          })}
        </div>

        {/* Section 2: Active User Contracts */}
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '20px' }}>{t('activeContracts')} ({userContracts.length})</h2>
        <div className="glass-card" style={{ padding: '24px' }}>
          <div className="custom-table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>{t('contractCode')}</th>
                  <th>{t('planName')}</th>
                  <th>{t('miningHashrate')}</th>
                  <th>{t('amount')}</th>
                  <th>{t('startDate')}</th>
                  <th>{t('endDate')}</th>
                  <th>{t('status')}</th>
                </tr>
              </thead>
              <tbody>
                {userContracts.length > 0 ? (
                  userContracts.map((c) => (
                    <tr key={c.id}>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#38bdf8' }}>{c.contractCode}</td>
                      <td style={{ fontWeight: 600 }}>{getTranslatedPlanName(c.planName)}</td>
                      <td style={{ fontWeight: 700, color: '#fbbf24' }}>{c.hashrate} MH/s</td>
                      <td style={{ fontWeight: 700 }}>{c.pricePaid === 0 ? t('freeText') : `${c.pricePaid} USDT`}</td>
                      <td>{new Date(c.startDate).toLocaleDateString()}</td>
                      <td>{new Date(c.endDate).toLocaleDateString()}</td>
                      <td>
                        <span className={`badge ${c.status === 'ACTIVE' ? 'badge-active' : 'badge-failed'}`}>{c.status}</span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '30px' }}>
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
