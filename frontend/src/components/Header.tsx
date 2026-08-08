import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { LanguageSwitcher } from './LanguageSwitcher';
import { Cpu, LogIn, UserPlus, LayoutDashboard, LogOut, Menu, X } from 'lucide-react';

export const Header: React.FC = () => {
  const { isAuthenticated, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="glass-nav">
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: 'linear-gradient(135deg, #0284c7, #38bdf8)', padding: '10px', borderRadius: '12px', display: 'flex', boxShadow: '0 0 15px rgba(56, 189, 248, 0.4)' }}>
            <Cpu size={24} color="#ffffff" />
          </div>
          <span style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.5px', background: 'linear-gradient(90deg, #ffffff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Crypto<span style={{ color: '#38bdf8', WebkitTextFillColor: '#38bdf8' }}>Mine</span>
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="nav-desktop-links" style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          <a href="#plans" style={{ color: 'var(--text-muted)', fontWeight: 500, transition: 'color 0.2s' }}>{t('miningPlans')}</a>
          <a href="#how-it-works" style={{ color: 'var(--text-muted)', fontWeight: 500 }}>{t('howItWorks')}</a>
          <a href="#calculator" style={{ color: 'var(--text-muted)', fontWeight: 500 }}>{t('calculator')}</a>
          <a href="#faq" style={{ color: 'var(--text-muted)', fontWeight: 500 }}>{t('faq')}</a>
        </nav>

        {/* Action Buttons & Language Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <LanguageSwitcher />

          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="btn-primary">
                <LayoutDashboard size={18} />
                <span className="btn-label-text">{t('dashboard')}</span>
              </Link>
              <button onClick={() => { logout(); navigate('/'); }} className="btn-secondary">
                <LogOut size={18} />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-secondary">
                <LogIn size={18} />
                <span className="btn-label-text">{t('login')}</span>
              </Link>
              <Link to="/register" className="btn-primary">
                <UserPlus size={18} />
                <span className="btn-label-text">{t('register')}</span>
              </Link>
            </>
          )}

          {/* Mobile Menu Button */}
          <button
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{ display: 'none', background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: '6px' }}
          >
            {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div style={{ background: '#0b1329', borderBottom: '1px solid var(--glass-border)', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <a href="#plans" onClick={() => setMobileMenuOpen(false)} style={{ color: '#fff', fontWeight: 600 }}>{t('miningPlans')}</a>
          <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} style={{ color: '#fff', fontWeight: 600 }}>{t('howItWorks')}</a>
          <a href="#calculator" onClick={() => setMobileMenuOpen(false)} style={{ color: '#fff', fontWeight: 600 }}>{t('calculator')}</a>
          <a href="#faq" onClick={() => setMobileMenuOpen(false)} style={{ color: '#fff', fontWeight: 600 }}>{t('faq')}</a>
        </div>
      )}
    </header>
  );
};
