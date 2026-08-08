import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { LanguageSwitcher } from './LanguageSwitcher';
import { 
  LayoutDashboard, 
  Cpu, 
  ShoppingBag, 
  Wallet, 
  ArrowDownLeft, 
  ArrowUpRight, 
  History, 
  Users, 
  LogOut, 
  Shield, 
  Settings, 
  ListChecks,
  UserCheck,
  Menu,
  X
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { user, logout, isAdmin } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [isOpenMobile, setIsOpenMobile] = useState(false);

  const userNavItems = [
    { to: '/dashboard', label: t('dashboard'), icon: LayoutDashboard },
    { to: '/mining', label: t('miningOutput'), icon: Cpu },
    { to: '/plans', label: t('myPlans'), icon: ShoppingBag },
    { to: '/wallet', label: t('wallet'), icon: Wallet },
    { to: '/deposit', label: t('depositUsdt'), icon: ArrowDownLeft },
    { to: '/withdraw', label: t('withdraw'), icon: ArrowUpRight },
    { to: '/transactions', label: t('transactions'), icon: History },
    { to: '/referrals', label: t('referrals'), icon: Users },
    { to: '/settings', label: t('userSettings'), icon: Settings },
  ];

  const adminNavItems = [
    { to: '/admin/dashboard', label: t('adminOverviewTitle'), icon: LayoutDashboard },
    { to: '/admin/users', label: t('userManagement'), icon: UserCheck },
    { to: '/admin/plans', label: t('planManagement'), icon: ShoppingBag },
    { to: '/admin/contracts', label: t('contractManagement'), icon: Cpu },
    { to: '/admin/deposits', label: t('depositRequests'), icon: ArrowDownLeft },
    { to: '/admin/withdrawals', label: t('withdrawalRequests'), icon: ArrowUpRight },
    { to: '/admin/settings', label: t('systemSettingsTitle'), icon: Settings },
    { to: '/admin/logs', label: t('auditLogsTitle'), icon: ListChecks },
  ];

  const navItems = isAdmin ? adminNavItems : userNavItems;

  return (
    <>
      {/* Mobile Sticky Top Header Bar with Menu Toggle */}
      <div
        className="mobile-top-header"
        style={{
          display: 'none',
          position: 'sticky',
          top: 0,
          zIndex: 900,
          background: '#0b1329',
          borderBottom: '1px solid var(--glass-border)',
          padding: '12px 20px',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ background: 'linear-gradient(135deg, #0284c7, #38bdf8)', padding: '6px', borderRadius: '8px', display: 'flex' }}>
            <Cpu size={18} color="#fff" />
          </div>
          <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>CryptoMine</span>
        </div>
        <button
          onClick={() => setIsOpenMobile(!isOpenMobile)}
          style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: '6px' }}
        >
          {isOpenMobile ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Backdrop Overlay */}
      {isOpenMobile && (
        <div
          onClick={() => setIsOpenMobile(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 998 }}
        />
      )}

      <aside
        className={`app-sidebar ${isOpenMobile ? 'open' : ''}`}
        style={{
          width: '260px',
          background: '#0b1329',
          borderRight: '1px solid var(--glass-border)',
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          position: 'sticky',
          top: 0,
          zIndex: 999,
        }}
      >
        <div style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--glass-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: isAdmin ? 'linear-gradient(135deg, #f59e0b, #ef4444)' : 'linear-gradient(135deg, #0284c7, #38bdf8)', padding: '8px', borderRadius: '10px', display: 'flex' }}>
              {isAdmin ? <Shield size={20} color="#fff" /> : <Cpu size={20} color="#fff" />}
            </div>
            <div>
              <span style={{ fontSize: '1.2rem', fontWeight: 800 }}>CryptoMine</span>
              {isAdmin && <span style={{ display: 'block', fontSize: '0.7rem', color: '#fbbf24', fontWeight: 700, letterSpacing: '0.05em' }}>{t('adminPortal')}</span>}
            </div>
          </div>
          <button
            onClick={() => setIsOpenMobile(false)}
            className="mobile-close-btn"
            style={{ display: 'none', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Language Switcher inside Sidebar */}
        <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'center' }}>
          <LanguageSwitcher />
        </div>

        <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', gap: '6px', overflowY: 'auto' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setIsOpenMobile(false)}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  color: isActive ? '#ffffff' : 'var(--text-muted)',
                  background: isActive ? (isAdmin ? 'rgba(245, 158, 11, 0.15)' : 'rgba(56, 189, 248, 0.15)') : 'transparent',
                  border: isActive ? (isAdmin ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid rgba(56, 189, 248, 0.3)') : '1px solid transparent',
                  transition: 'all 0.2s ease',
                })}
              >
                <Icon size={18} />
                {item.label}
              </NavLink>
            );
          })}
        </div>

        <div style={{ padding: '16px', borderTop: '1px solid var(--glass-border)' }}>
          <div style={{ padding: '12px', background: 'rgba(15, 23, 42, 0.6)', borderRadius: '12px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #38bdf8, #818cf8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.9rem', flexShrink: 0 }}>
              {user?.fullName?.[0]?.toUpperCase() || 'U'}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <span style={{ display: 'block', fontWeight: 700, fontSize: '0.9rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{user?.fullName}</span>
              <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{user?.email}</span>
            </div>
          </div>

          <button
            onClick={() => { logout(); navigate('/'); }}
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px', background: 'rgba(239, 68, 68, 0.1)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '10px', fontWeight: 600, cursor: 'pointer' }}
          >
            <LogOut size={16} />
            {t('logout')}
          </button>
        </div>
      </aside>
    </>
  );
};
