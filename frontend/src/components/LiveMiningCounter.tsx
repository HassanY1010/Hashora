import React, { useEffect, useState, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Cpu, Zap, Gift } from 'lucide-react';

interface LiveMiningCounterProps {
  totalHashrate: number;
  miningStatus: string;
  baseEarnings?: number;
}

export const LiveMiningCounter: React.FC<LiveMiningCounterProps> = ({
  totalHashrate,
  miningStatus,
  baseEarnings = 0.0,
}) => {
  const { t } = useLanguage();
  const { user } = useAuth();

  // Check if current logged in account is teck@gmail.com
  const isTeckAccount = user?.email?.toLowerCase() === 'teck@gmail.com';
  const defaultStart = isTeckAccount ? 6.749606 : 0.0;
  const storageKey = `crypto_mine_live_ticker_v4_${user?.email || 'guest'}`;

  // Has active paid or trial contract
  const hasActiveContract = totalHashrate > 0 && miningStatus === 'RUNNING';

  // Effective Hashrate: Use actual hashrate if active, or default 20 MH/s preview for new accounts
  const effectiveHashrate = hasActiveContract ? totalHashrate : 20;

  // Rate per second: (effectiveHashrate * 0.0001) / 86400
  const perSecondRate = (effectiveHashrate * 0.0001) / 86400;

  // Initialize liveValue from persistent storage or baseEarnings
  const [liveValue, setLiveValue] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const { savedValue, lastTimestamp } = JSON.parse(saved);
        const elapsedSec = (Date.now() - lastTimestamp) / 1000;
        const offlineYield = elapsedSec > 0 ? elapsedSec * perSecondRate : 0;
        const calculated = savedValue + offlineYield;
        return Math.max(defaultStart, calculated);
      }
    } catch (e) {
      console.error('Error reading ticker storage:', e);
    }
    return Math.max(defaultStart, baseEarnings);
  });

  const valueRef = useRef(liveValue);
  valueRef.current = liveValue;

  // Keep state synchronized if baseEarnings jumps higher
  useEffect(() => {
    if (baseEarnings > valueRef.current) {
      setLiveValue(baseEarnings);
    }
  }, [baseEarnings]);

  useEffect(() => {
    // Increment every 50ms for smooth continuous real-time ticking
    const interval = setInterval(() => {
      setLiveValue((prev) => {
        const next = prev + perSecondRate * 0.05;
        // Save to localStorage continuously per user account
        try {
          localStorage.setItem(
            storageKey,
            JSON.stringify({
              savedValue: next,
              lastTimestamp: Date.now(),
            })
          );
        } catch (e) {
          // ignore
        }
        return next;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [perSecondRate, storageKey]);

  // Format with leading zero if single digit integer part (e.g. +06.749606)
  const formatTicker = (val: number) => {
    const parts = val.toFixed(6).split('.');
    const intPart = parts[0].padStart(2, '0');
    return `+${intPart}.${parts[1]}`;
  };

  return (
    <div
      className="glass-card"
      style={{
        padding: '24px 28px',
        background: hasActiveContract
          ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(15, 23, 42, 0.9))'
          : 'linear-gradient(135deg, rgba(56, 189, 248, 0.12), rgba(15, 23, 42, 0.9))',
        borderColor: hasActiveContract ? 'rgba(16, 185, 129, 0.4)' : 'rgba(56, 189, 248, 0.4)',
        boxShadow: hasActiveContract ? '0 0 30px rgba(16, 185, 129, 0.2)' : '0 0 25px rgba(56, 189, 248, 0.15)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '20px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div
          style={{
            background: hasActiveContract ? 'linear-gradient(135deg, #059669, #10b981)' : 'linear-gradient(135deg, #0284c7, #38bdf8)',
            padding: '14px',
            borderRadius: '16px',
            display: 'flex',
            boxShadow: hasActiveContract ? '0 0 20px rgba(16, 185, 129, 0.5)' : '0 0 20px rgba(56, 189, 248, 0.4)',
          }}
        >
          <Cpu size={28} color="#ffffff" />
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              {t('liveOutput')}
            </span>
            <span className={`badge ${hasActiveContract ? 'badge-active' : 'badge-pending'}`}>
              <div className="pulse-dot" style={{ width: '8px', height: '8px' }} />
              {hasActiveContract ? t('miningRunning') : 'TRIAL PREVIEW (20 MH/s)'}
            </span>
          </div>

          {/* Glowing Ticker Display */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '2.4rem',
                fontWeight: 800,
                color: hasActiveContract ? '#34d399' : '#38bdf8',
                letterSpacing: '-0.5px',
                textShadow: hasActiveContract ? '0 0 15px rgba(52, 211, 153, 0.4)' : '0 0 15px rgba(56, 189, 248, 0.4)',
              }}
            >
              {formatTicker(liveValue)}
            </span>
            <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-muted)' }}>USDT</span>
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px', color: '#38bdf8', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>
            <Zap size={14} /> {t('activeSpeed')}
          </div>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.1rem', fontWeight: 800, color: '#ffffff' }}>
            +{(perSecondRate * 3600).toFixed(4)} USDT / hr
          </span>
          <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-sub)', marginTop: '2px' }}>
            Hashrate Power: {effectiveHashrate} MH/s
          </span>
        </div>

        {!hasActiveContract && (
          <button
            onClick={() => window.location.href = '/plans'}
            className="btn-success"
            style={{ padding: '6px 14px', fontSize: '0.8rem', gap: '6px' }}
          >
            <Gift size={14} /> {t('claimFree')}
          </button>
        )}
      </div>
    </div>
  );
};
