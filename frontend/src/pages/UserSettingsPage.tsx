import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/Sidebar';
import { apiClient } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { User, Lock, Wallet, Shield, CheckCircle, Save, KeyRound } from 'lucide-react';

export const UserSettingsPage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const { t } = useLanguage();
  const { showToast } = useToast();

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [walletAddress, setWalletAddress] = useState('');
  const [loadingProfile, setLoadingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [loadingPassword, setLoadingPassword] = useState(false);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      const res = await apiClient.get('/api/users/profile');
      if (res.data.fullName) setFullName(res.data.fullName);
      if (res.data.walletAddresses && res.data.walletAddresses.length > 0) {
        setWalletAddress(res.data.walletAddresses[0].address);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingProfile(true);
    try {
      const res = await apiClient.put('/api/users/profile', {
        fullName,
        walletAddress,
      });
      showToast(res.data.message || 'Profile updated successfully!', 'success');
      if (refreshUser) refreshUser();
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      showToast(t('passwordsMismatch'), 'error');
      return;
    }

    setLoadingPassword(true);
    try {
      const res = await apiClient.put('/api/users/change-password', {
        currentPassword,
        newPassword,
      });
      showToast(res.data.message || 'Password updated successfully!', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setLoadingPassword(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />

      <main style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>{t('userSettingsTitle')}</h1>
          <p style={{ color: 'var(--text-muted)' }}>{t('userSettingsSub')}</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '28px' }}>
          {/* Section 1: Profile & Personal Details */}
          <div className="glass-card" style={{ padding: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <div style={{ background: 'rgba(56, 189, 248, 0.15)', padding: '8px', borderRadius: '10px' }}>
                <User size={20} color="#38bdf8" />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{t('profileInfoSection')}</h3>
            </div>

            <form onSubmit={handleUpdateProfile}>
              <div className="input-group">
                <label className="input-label">{t('fullNameLabel')}</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    className="input-field"
                    style={{ width: '100%', paddingLeft: '42px' }}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                  <User size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">{t('emailAddressLabel')}</label>
                <input
                  type="email"
                  className="input-field"
                  value={user?.email || ''}
                  disabled
                  style={{ opacity: 0.7, cursor: 'not-allowed', background: 'rgba(15, 23, 42, 0.6)' }}
                />
              </div>

              <div className="input-group">
                <label className="input-label">{t('defaultWalletAddressLabel')}</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    className="input-field"
                    style={{ width: '100%', paddingLeft: '42px', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}
                    placeholder="e.g. TX73CSgKBtnu5kKJaX6AcGMVphD6Wg61An"
                    value={walletAddress}
                    onChange={(e) => setWalletAddress(e.target.value)}
                  />
                  <Wallet size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
              </div>

              <button
                type="submit"
                className="btn-primary"
                disabled={loadingProfile}
                style={{ width: '100%', padding: '12px', justifyContent: 'center', marginTop: '10px' }}
              >
                <Save size={18} />
                {loadingProfile ? t('processingBtn') : t('updateProfileBtn')}
              </button>
            </form>
          </div>

          {/* Section 2: Security & Password Change */}
          <div className="glass-card" style={{ padding: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <div style={{ background: 'rgba(245, 158, 11, 0.15)', padding: '8px', borderRadius: '10px' }}>
                <KeyRound size={20} color="#fbbf24" />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{t('securityPasswordSection')}</h3>
            </div>

            <form onSubmit={handleChangePassword}>
              <div className="input-group">
                <label className="input-label">{t('currentPasswordLabel')}</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="password"
                    className="input-field"
                    style={{ width: '100%', paddingLeft: '42px' }}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                  <Lock size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">{t('newPasswordLabel')}</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="password"
                    className="input-field"
                    style={{ width: '100%', paddingLeft: '42px' }}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                  <Lock size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">{t('confirmNewPasswordLabel')}</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="password"
                    className="input-field"
                    style={{ width: '100%', paddingLeft: '42px' }}
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    required
                  />
                  <Lock size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
              </div>

              <button
                type="submit"
                className="btn-secondary"
                disabled={loadingPassword}
                style={{ width: '100%', padding: '12px', justifyContent: 'center', marginTop: '10px' }}
              >
                <Shield size={18} />
                {loadingPassword ? t('processingBtn') : t('changePasswordBtn')}
              </button>
            </form>
          </div>

          {/* Section 3: Account Membership Overview Card */}
          <div className="glass-card" style={{ padding: '28px', gridColumn: '1 / -1' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <div style={{ background: 'rgba(16, 185, 129, 0.15)', padding: '8px', borderRadius: '10px' }}>
                <CheckCircle size={20} color="#34d399" />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{t('accountSummarySection')}</h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '16px', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>{t('accountRole')}</span>
                <span className="badge badge-active" style={{ fontSize: '0.85rem' }}>{user?.role || 'USER'}</span>
              </div>

              <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '16px', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>{t('accountStatus')}</span>
                <span className="badge badge-confirmed" style={{ fontSize: '0.85rem' }}>ACTIVE</span>
              </div>

              <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '16px', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>{t('referralCodeText')}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#38bdf8', fontSize: '1.1rem' }}>{user?.referralCode || 'HASSAN2026'}</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
