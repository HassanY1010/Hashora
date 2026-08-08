import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Calculator as CalcIcon, Zap, Award } from 'lucide-react';

export const Calculator: React.FC = () => {
  const { t } = useLanguage();
  const [selectedPlanPrice, setSelectedPlanPrice] = useState<number>(10); // Default Pro plan

  const plans = [
    { name: t('freeTrial'), price: 0, hashrate: 20, duration: 30, expectedUsdt: '0.50 - 1.00' },
    { name: t('starterPlan'), price: 5, hashrate: 100, duration: 30, expectedUsdt: '6.00 - 7.00' },
    { name: t('proPlan'), price: 10, hashrate: 700, duration: 30, expectedUsdt: '11.50 - 14.00' },
    { name: t('premiumPlan'), price: 20, hashrate: 4500, duration: 30, expectedUsdt: '24.00 - 30.00' },
  ];

  const currentPlan = plans.find((p) => p.price === selectedPlanPrice) || plans[2];

  return (
    <div className="glass-card" id="calculator" style={{ padding: '36px', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <div style={{ background: 'rgba(56, 189, 248, 0.15)', padding: '10px', borderRadius: '12px' }}>
          <CalcIcon size={24} color="#38bdf8" />
        </div>
        <div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{t('interactiveCalculator')}</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{t('calcSubtitle')}</p>
        </div>
      </div>

      {/* Plan Selector Buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '32px' }}>
        {plans.map((p) => (
          <button
            key={p.price}
            onClick={() => setSelectedPlanPrice(p.price)}
            style={{
              padding: '14px 10px',
              borderRadius: '12px',
              border: selectedPlanPrice === p.price ? '2px solid #38bdf8' : '1px solid var(--glass-border)',
              background: selectedPlanPrice === p.price ? 'rgba(56, 189, 248, 0.15)' : 'rgba(15, 23, 42, 0.6)',
              color: '#ffffff',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              textAlign: 'center',
            }}
          >
            <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>{p.name}</span>
            <span style={{ fontSize: '1.2rem', fontWeight: 800 }}>{p.price} USDT</span>
          </button>
        ))}
      </div>

      {/* Calculation Output Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
        <div style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid var(--glass-border)', padding: '20px', borderRadius: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '8px' }}>
            <Zap size={16} color="#38bdf8" /> {t('miningHashrate')}
          </div>
          <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#38bdf8' }}>{currentPlan.hashrate} MH/s</span>
        </div>

        <div style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid var(--glass-border)', padding: '20px', borderRadius: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '8px' }}>
            <CalcIcon size={16} color="#818cf8" /> {t('contractDuration')}
          </div>
          <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff' }}>{currentPlan.duration} Days</span>
        </div>

        <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '20px', borderRadius: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#34d399', fontSize: '0.85rem', marginBottom: '8px', fontWeight: 700 }}>
            <Award size={16} color="#34d399" /> {t('estimatedOutput')}
          </div>
          <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#34d399' }}>≈ {currentPlan.expectedUsdt} USDT</span>
        </div>
      </div>
    </div>
  );
};
