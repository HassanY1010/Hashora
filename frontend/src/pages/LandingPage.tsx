import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Calculator } from '../components/Calculator';
import { TransactionsTicker } from '../components/TransactionsTicker';
import { FaqAccordion } from '../components/FaqAccordion';
import { useLanguage } from '../context/LanguageContext';
import { 
  Zap, 
  ShieldCheck, 
  Users, 
  Award, 
  ArrowRight, 
  CheckCircle, 
  Gift 
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { t } = useLanguage();

  // Reference epoch timestamp for deterministic continuous 30-min organic growth
  const EPOCH_START = 1770000000000;
  const THIRTY_MIN_MS = 30 * 60 * 1000; // 30 minutes in milliseconds

  // Calibrated Realistic SaaS Baseline Metrics
  const calculateDynamicStats = () => {
    const elapsedSteps = Math.max(0, Math.floor((Date.now() - EPOCH_START) / THIRTY_MIN_MS));
    return {
      totalUsers: 1420 + elapsedSteps * 2, // Realistic +2 users / 30 min
      totalHashrateMhs: 85000 + elapsedSteps * 250, // Realistic +0.25 TH/s / 30 min
      totalPaidRewardsUsdt: 14850 + elapsedSteps * 18.5, // Realistic +18.50 USDT / 30 min
      activeContractsCount: 980 + elapsedSteps * 1, // Realistic +1 contract / 30 min
    };
  };

  const [stats, setStats] = useState<any>(calculateDynamicStats);

  useEffect(() => {
    // Re-calculate realistic stats every 30 minutes dynamically
    const timer = setInterval(() => {
      setStats((prev: any) => ({
        totalUsers: prev.totalUsers + 2,
        totalHashrateMhs: prev.totalHashrateMhs + 250,
        totalPaidRewardsUsdt: prev.totalPaidRewardsUsdt + 18.5,
        activeContractsCount: prev.activeContractsCount + 1,
      }));
    }, THIRTY_MIN_MS);

    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />

      {/* Hero Section */}
      <section style={{ padding: '90px 24px 70px 24px', textAlign: 'center', position: 'relative' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.25)', padding: '6px 18px', borderRadius: '30px', color: '#38bdf8', fontSize: '0.9rem', fontWeight: 600, marginBottom: '24px' }}>
            <Zap size={16} />
            {t('heroBadge')}
          </div>

          <h1 style={{ fontSize: '3.6rem', fontWeight: 800, lineHeight: '1.15', marginBottom: '24px', letterSpacing: '-1px' }}>
            {t('heroTitleLine1')} <br />
            <span style={{ background: 'linear-gradient(135deg, #38bdf8 0%, #818cf8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {t('heroTitleLine2')}
            </span>
          </h1>

          <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', lineHeight: '1.7', marginBottom: '40px', maxWidth: '720px', margin: '0 auto 40px auto' }}>
            {t('heroSubtitle')}
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn-primary" style={{ padding: '16px 36px', fontSize: '1.1rem' }}>
              {t('startMiningNow')}
              <ArrowRight size={20} />
            </Link>
            <a href="#plans" className="btn-secondary" style={{ padding: '16px 32px', fontSize: '1.1rem' }}>
              {t('viewPlans')}
            </a>
          </div>
        </div>
      </section>

      {/* Statistics Section - Calibrated Realistic SaaS Metrics */}
      <section style={{ padding: '30px 24px 60px 24px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
          <div className="glass-card" style={{ padding: '24px', textAlign: 'center' }}>
            <Users size={28} color="#38bdf8" style={{ marginBottom: '10px' }} />
            <span style={{ display: 'block', fontSize: '2rem', fontWeight: 800, color: '#fff' }}>
              {stats.totalUsers.toLocaleString()}
            </span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>{t('registeredUsers')}</span>
          </div>

          <div className="glass-card" style={{ padding: '24px', textAlign: 'center' }}>
            <Zap size={28} color="#fbbf24" style={{ marginBottom: '10px' }} />
            <span style={{ display: 'block', fontSize: '2rem', fontWeight: 800, color: '#fff' }}>
              {(stats.totalHashrateMhs / 1000).toFixed(0)} TH/s
            </span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>{t('totalHashrate')}</span>
          </div>

          <div className="glass-card" style={{ padding: '24px', textAlign: 'center' }}>
            <Award size={28} color="#10b981" style={{ marginBottom: '10px' }} />
            <span style={{ display: 'block', fontSize: '2rem', fontWeight: 800, color: '#34d399' }}>
              {Math.floor(stats.totalPaidRewardsUsdt).toLocaleString()} USDT
            </span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>{t('paidRewards')}</span>
          </div>

          <div className="glass-card" style={{ padding: '24px', textAlign: 'center' }}>
            <ShieldCheck size={28} color="#818cf8" style={{ marginBottom: '10px' }} />
            <span style={{ display: 'block', fontSize: '2rem', fontWeight: 800, color: '#fff' }}>
              {stats.activeContractsCount.toLocaleString()}
            </span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>{t('activeContracts')}</span>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" style={{ padding: '70px 24px', background: 'rgba(15, 23, 42, 0.4)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '50px' }}>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 800 }}>{t('howItWorks')}</h2>
            <p style={{ color: 'var(--text-muted)' }}>Get started in 5 simple, automated steps.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
            <div className="glass-card" style={{ padding: '28px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(56,189,248,0.2)', color: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, marginBottom: '16px' }}>1</div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '8px' }}>{t('step1Title')}</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{t('step1Desc')}</p>
            </div>

            <div className="glass-card" style={{ padding: '28px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(16,185,129,0.2)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, marginBottom: '16px' }}>2</div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '8px' }}>{t('step2Title')}</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{t('step2Desc')}</p>
            </div>

            <div className="glass-card" style={{ padding: '28px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(245,158,11,0.2)', color: '#fbbf24', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, marginBottom: '16px' }}>3</div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '8px' }}>{t('step3Title')}</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{t('step3Desc')}</p>
            </div>

            <div className="glass-card" style={{ padding: '28px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(129,140,248,0.2)', color: '#818cf8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, marginBottom: '16px' }}>4</div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '8px' }}>{t('step4Title')}</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{t('step4Desc')}</p>
            </div>

            <div className="glass-card" style={{ padding: '28px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(236,72,153,0.2)', color: '#ec4899', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, marginBottom: '16px' }}>5</div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '8px' }}>{t('step5Title')}</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{t('step5Desc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Mining Plans Section */}
      <section id="plans" style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '50px' }}>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 800 }}>{t('availablePlans')}</h2>
            <p style={{ color: 'var(--text-muted)' }}>{t('chooseCapacity')}</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px' }}>
            {/* 1. Free Trial Plan */}
            <div className="glass-card" style={{ padding: '32px', display: 'flex', flexDirection: 'column', position: 'relative', borderColor: 'rgba(16, 185, 129, 0.4)' }}>
              <span className="badge badge-active" style={{ width: 'fit-content', marginBottom: '16px', background: 'rgba(16, 185, 129, 0.2)', color: '#34d399' }}>
                <Gift size={14} style={{ marginRight: '4px' }} /> 🆓 {t('freeTrial')}
              </span>
              <h3 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '8px' }}>{t('freeTrial')}</h3>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '16px' }}>
                <span style={{ fontSize: '2.4rem', fontWeight: 800, color: '#34d399' }}>0</span>
                <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>USDT</span>
              </div>

              {/* Expected Yield Box */}
              <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px dashed rgba(16, 185, 129, 0.3)', padding: '10px 14px', borderRadius: '10px', marginBottom: '20px' }}>
                <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>{t('expectedYield')} (30 Days)</span>
                <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#34d399' }}>≈ 0.50 - 1.00 USDT</span>
              </div>

              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px', flex: 1 }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.95rem' }}><CheckCircle size={18} color="#10b981" /> ⚡ <strong>20 MH/s</strong> {t('miningHashrate')}</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.95rem' }}><CheckCircle size={18} color="#10b981" /> ⏱ <strong>{t('duration30Days')}</strong></li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.95rem' }}><CheckCircle size={18} color="#10b981" /> 🎁 {t('freeTrial')}</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.95rem' }}><CheckCircle size={18} color="#10b981" /> 🔒 {t('oneClaimPerUser')}</li>
              </ul>

              <Link to="/register" className="btn-success" style={{ justifyContent: 'center' }}>{t('claimFree')}</Link>
            </div>

            {/* 2. Starter Contract */}
            <div className="glass-card" style={{ padding: '32px', display: 'flex', flexDirection: 'column', position: 'relative' }}>
              <span className="badge badge-active" style={{ width: 'fit-content', marginBottom: '16px' }}>🚀 {t('starterPlan')}</span>
              <h3 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '8px' }}>Starter</h3>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '16px' }}>
                <span style={{ fontSize: '2.4rem', fontWeight: 800, color: '#38bdf8' }}>5</span>
                <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>USDT</span>
              </div>

              {/* Expected Yield Box */}
              <div style={{ background: 'rgba(56, 189, 248, 0.1)', border: '1px dashed rgba(56, 189, 248, 0.3)', padding: '10px 14px', borderRadius: '10px', marginBottom: '20px' }}>
                <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>{t('expectedYield')} (30 Days)</span>
                <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#38bdf8' }}>≈ 6.00 - 7.00 USDT</span>
              </div>

              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px', flex: 1 }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.95rem' }}><CheckCircle size={18} color="#38bdf8" /> ⚡ <strong>100 MH/s</strong> {t('miningHashrate')}</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.95rem' }}><CheckCircle size={18} color="#38bdf8" /> ⏱ <strong>{t('duration30Days')}</strong></li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.95rem' }}><CheckCircle size={18} color="#38bdf8" /> 💳 {t('dailyAutomated')}</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.95rem' }}><CheckCircle size={18} color="#38bdf8" /> 📊 {t('realTimeTracking')}</li>
              </ul>

              <Link to="/register" className="btn-secondary" style={{ justifyContent: 'center' }}>{t('buyStarter')}</Link>
            </div>

            {/* 3. Pro Contract - Featured */}
            <div className="glass-card" style={{ padding: '32px', display: 'flex', flexDirection: 'column', position: 'relative', borderColor: 'var(--primary)', boxShadow: '0 0 35px var(--primary-glow)' }}>
              <div style={{ position: 'absolute', top: '-14px', right: '24px', background: 'linear-gradient(135deg, #0284c7, #38bdf8)', color: '#fff', fontSize: '0.8rem', fontWeight: 800, padding: '4px 14px', borderRadius: '20px', textTransform: 'uppercase' }}>{t('mostPopular')}</div>
              <span className="badge badge-active" style={{ width: 'fit-content', marginBottom: '16px' }}>⭐ {t('proPlan')}</span>
              <h3 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '8px' }}>Pro</h3>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '16px' }}>
                <span style={{ fontSize: '2.4rem', fontWeight: 800, color: '#38bdf8' }}>10</span>
                <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>USDT</span>
              </div>

              {/* Expected Yield Box */}
              <div style={{ background: 'rgba(56, 189, 248, 0.15)', border: '1px dashed #38bdf8', padding: '10px 14px', borderRadius: '10px', marginBottom: '20px' }}>
                <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>{t('expectedYield')} (30 Days)</span>
                <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#38bdf8' }}>≈ 11.50 - 14.00 USDT</span>
              </div>

              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px', flex: 1 }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.95rem' }}><CheckCircle size={18} color="#38bdf8" /> ⚡ <strong>700 MH/s</strong> {t('miningHashrate')}</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.95rem' }}><CheckCircle size={18} color="#38bdf8" /> ⏱ <strong>{t('duration30Days')}</strong></li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.95rem' }}><CheckCircle size={18} color="#38bdf8" /> ⏰ {t('hourlyUpdates')}</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.95rem' }}><CheckCircle size={18} color="#38bdf8" /> 💸 {t('priorityQueue')}</li>
              </ul>

              <Link to="/register" className="btn-primary" style={{ justifyContent: 'center' }}>{t('buyPro')}</Link>
            </div>

            {/* 4. Premium Contract */}
            <div className="glass-card" style={{ padding: '32px', display: 'flex', flexDirection: 'column', position: 'relative', borderColor: 'rgba(251, 191, 36, 0.4)' }}>
              <span className="badge badge-active" style={{ width: 'fit-content', marginBottom: '16px', background: 'rgba(251, 191, 36, 0.15)', color: '#fbbf24' }}>💎 {t('premiumPlan')}</span>
              <h3 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '8px' }}>Premium</h3>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '16px' }}>
                <span style={{ fontSize: '2.4rem', fontWeight: 800, color: '#fbbf24' }}>20</span>
                <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>USDT</span>
              </div>

              {/* Expected Yield Box */}
              <div style={{ background: 'rgba(251, 191, 36, 0.1)', border: '1px dashed rgba(251, 191, 36, 0.3)', padding: '10px 14px', borderRadius: '10px', marginBottom: '20px' }}>
                <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>{t('expectedYield')} (30 Days)</span>
                <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fbbf24' }}>≈ 24.00 - 30.00 USDT</span>
              </div>

              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px', flex: 1 }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.95rem' }}><CheckCircle size={18} color="#fbbf24" /> ⚡ <strong>4,500 MH/s</strong> {t('miningHashrate')}</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.95rem' }}><CheckCircle size={18} color="#fbbf24" /> ⏱ <strong>{t('duration30Days')}</strong></li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.95rem' }}><CheckCircle size={18} color="#fbbf24" /> 🚀 {t('maxMiningCapacity')}</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.95rem' }}><CheckCircle size={18} color="#fbbf24" /> 👤 {t('vipSupport')}</li>
              </ul>

              <Link to="/register" className="btn-secondary" style={{ justifyContent: 'center' }}>{t('buyPremium')}</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Calculator Section */}
      <section style={{ padding: '40px 24px 80px 24px' }}>
        <Calculator />
      </section>

      {/* Transactions Ticker Section */}
      <section style={{ padding: '20px 24px 80px 24px' }}>
        <TransactionsTicker />
      </section>

      {/* FAQ Section */}
      <section style={{ padding: '20px 24px 80px 24px' }}>
        <FaqAccordion />
      </section>

      <Footer />
    </div>
  );
};
