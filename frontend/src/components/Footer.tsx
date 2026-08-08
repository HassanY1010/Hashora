import React from 'react';
import { Cpu, ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer style={{ background: '#030712', borderTop: '1px solid var(--glass-border)', padding: '60px 24px 30px 24px', marginTop: '80px' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '40px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <Cpu size={24} color="#38bdf8" />
            <span style={{ fontSize: '1.4rem', fontWeight: 800 }}>CryptoMine</span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.6' }}>
            Professional Cloud Mining SaaS Platform. Purchase mining power (Hashrate) and monitor your daily USDT yields with complete transparency and automated payments.
          </p>
        </div>

        <div>
          <h4 style={{ color: '#ffffff', marginBottom: '16px', fontWeight: 700 }}>Supported Currency</h4>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '12px 16px', borderRadius: '12px', width: 'fit-content' }}>
            <ShieldCheck size={20} color="#10b981" />
            <div>
              <span style={{ display: 'block', fontWeight: 700, color: '#34d399' }}>USDT (TRC20)</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>TRON Network Only</span>
            </div>
          </div>
        </div>

        <div>
          <h4 style={{ color: '#ffffff', marginBottom: '16px', fontWeight: 700 }}>Quick Links</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            <li><a href="#plans">Mining Plans</a></li>
            <li><a href="#how-it-works">How It Works</a></li>
            <li><a href="#calculator">Yield Calculator</a></li>
            <li><a href="/login">User Login</a></li>
            <li><a href="/admin/login">Admin Portal</a></li>
          </ul>
        </div>

        <div>
          <h4 style={{ color: '#ffffff', marginBottom: '16px', fontWeight: 700 }}>Security & Compliance</h4>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6' }}>
            All operations are backed by immutable database ledgers and verified TRC20 blockchain transaction records.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '1280px', margin: '40px auto 0 auto', paddingTop: '24px', borderTop: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', color: 'var(--text-sub)', fontSize: '0.85rem' }}>
        <span>&copy; 2026 CryptoMine SaaS. All rights reserved.</span>
        <div style={{ display: 'flex', gap: '20px' }}>
          <span>Terms of Service</span>
          <span>Privacy Policy</span>
          <span>Security Protocol</span>
        </div>
      </div>
    </footer>
  );
};
