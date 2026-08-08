import React, { useEffect, useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { apiClient } from '../api/client';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import { Save } from 'lucide-react';

export const AdminSettingsPage: React.FC = () => {
  const { t } = useLanguage();
  const [rewardRate, setRewardRate] = useState('0.0001');
  const [minWithdraw, setMinWithdraw] = useState('5.0');
  const [withdrawalFee, setWithdrawalFee] = useState('1.0');
  const [receiverAddress, setReceiverAddress] = useState('TF73CSgKBtnu5kKJaX6AcGMVphD6Wg61An');
  const [payoutSenderAddress, setPayoutSenderAddress] = useState('DK73CSgKBtnu5kKJaX6AcGMVphD6Wg37Am');
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await apiClient.get('/api/admin/settings');
      if (res.data.REWARD_RATE) setRewardRate(res.data.REWARD_RATE);
      if (res.data.MIN_WITHDRAWAL_AMOUNT) setMinWithdraw(res.data.MIN_WITHDRAWAL_AMOUNT);
      if (res.data.WITHDRAWAL_FEE) setWithdrawalFee(res.data.WITHDRAWAL_FEE);
      if (res.data.PLATFORM_TRC20_RECEIVER_ADDRESS) setReceiverAddress(res.data.PLATFORM_TRC20_RECEIVER_ADDRESS);
      if (res.data.PLATFORM_PAYOUT_SENDER_ADDRESS) setPayoutSenderAddress(res.data.PLATFORM_PAYOUT_SENDER_ADDRESS);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveSetting = async (key: string, value: string, description: string) => {
    setLoading(true);
    try {
      await apiClient.put('/api/admin/settings', { key, value, description });
      showToast(`Successfully updated ${key}`, 'success');
      fetchSettings();
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />

      <main style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>{t('systemSettingsTitle')}</h1>
          <p style={{ color: 'var(--text-muted)' }}>{t('systemSettingsSub')}</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          {/* Setting 1: Reward Rate */}
          <div className="glass-card" style={{ padding: '28px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '8px' }}>Daily Reward Rate</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '16px' }}>USDT output per MH/s per day used by the automated yield engine.</p>
            <div className="input-group">
              <input type="number" step="any" className="input-field" value={rewardRate} onChange={(e) => setRewardRate(e.target.value)} />
            </div>
            <button onClick={() => handleSaveSetting('REWARD_RATE', rewardRate, 'Daily USDT output per MH/s')} className="btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
              <Save size={16} /> {t('saveSettings')}
            </button>
          </div>

          {/* Setting 2: Min Withdrawal Amount */}
          <div className="glass-card" style={{ padding: '28px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '8px' }}>Minimum Withdrawal (USDT)</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '16px' }}>Minimum USDT amount required to submit payout requests.</p>
            <div className="input-group">
              <input type="number" step="any" className="input-field" value={minWithdraw} onChange={(e) => setMinWithdraw(e.target.value)} />
            </div>
            <button onClick={() => handleSaveSetting('MIN_WITHDRAWAL_AMOUNT', minWithdraw, 'Minimum withdrawal threshold')} className="btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
              <Save size={16} /> {t('saveSettings')}
            </button>
          </div>

          {/* Setting 3: Withdrawal Fee */}
          <div className="glass-card" style={{ padding: '28px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '8px' }}>{t('flatNetworkFee')}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '16px' }}>Flat network fee deducted per withdrawal request.</p>
            <div className="input-group">
              <input type="number" step="any" className="input-field" value={withdrawalFee} onChange={(e) => setWithdrawalFee(e.target.value)} />
            </div>
            <button onClick={() => handleSaveSetting('WITHDRAWAL_FEE', withdrawalFee, 'Flat withdrawal network fee')} className="btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
              <Save size={16} /> {t('saveSettings')}
            </button>
          </div>

          {/* Setting 4: Receiver TRC20 Address */}
          <div className="glass-card" style={{ padding: '28px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '8px' }}>{t('receiverAddress')} (Deposits)</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '16px' }}>Public deposit receiver wallet address shown to users.</p>
            <div className="input-group">
              <input type="text" className="input-field" value={receiverAddress} onChange={(e) => setReceiverAddress(e.target.value)} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }} />
            </div>
            <button onClick={() => handleSaveSetting('PLATFORM_TRC20_RECEIVER_ADDRESS', receiverAddress, 'Platform deposit receiver address')} className="btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
              <Save size={16} /> {t('saveSettings')}
            </button>
          </div>

          {/* Setting 5: Payout Sender TRC20 Address */}
          <div className="glass-card" style={{ padding: '28px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '8px' }}>Platform Payout Sender Address (Withdrawals)</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '16px' }}>Official platform payout wallet address used to send user withdrawals.</p>
            <div className="input-group">
              <input type="text" className="input-field" value={payoutSenderAddress} onChange={(e) => setPayoutSenderAddress(e.target.value)} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }} />
            </div>
            <button onClick={() => handleSaveSetting('PLATFORM_PAYOUT_SENDER_ADDRESS', payoutSenderAddress, 'Platform official payout sender wallet address')} className="btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
              <Save size={16} /> {t('saveSettings')}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};
