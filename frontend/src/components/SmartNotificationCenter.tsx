import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import { useLanguage } from '../context/LanguageContext';
import { 
  Bell, 
  CheckCheck, 
  Wallet, 
  ArrowUpRight, 
  Zap, 
  Users, 
  Info,
  ChevronRight
} from 'lucide-react';

export const SmartNotificationCenter: React.FC = () => {
  const { t, isRtl } = useLanguage();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<any[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchNotifications();

    // Poll every 15 seconds for fresh intelligent notifications
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await apiClient.get('/api/notifications/my-notifications');
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch (err) {
      // Fallback demo notifications for testing
      setNotifications([
        {
          id: '1',
          title: 'Premium Contract Active',
          message: 'Your 4,500 MH/s Premium Cloud Mining Contract is generating hourly yields.',
          type: 'MINING',
          isRead: false,
          createdAt: new Date().toISOString(),
        },
        {
          id: '2',
          title: 'USDT TRC20 Ready',
          message: 'Fund your wallet or withdraw minimum 5.00 USDT at any time.',
          type: 'DEPOSIT',
          isRead: false,
          createdAt: new Date(Date.now() - 3600000).toISOString(),
        },
      ]);
      setUnreadCount(2);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await apiClient.patch('/api/notifications/read-all');
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleNotificationClick = async (notif: any) => {
    setIsOpen(false);

    if (!notif.isRead) {
      try {
        await apiClient.patch(`/api/notifications/${notif.id}/read`);
        setUnreadCount((prev) => Math.max(0, prev - 1));
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
        );
      } catch (err) {
        console.error(err);
      }
    }

    // Smart Navigation Router based on notification type
    switch (notif.type) {
      case 'DEPOSIT':
        navigate('/wallet');
        break;
      case 'WITHDRAWAL':
        navigate('/transactions');
        break;
      case 'MINING':
        navigate('/plans');
        break;
      case 'REFERRAL':
        navigate('/referrals');
        break;
      default:
        navigate('/dashboard');
        break;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'DEPOSIT':
        return <Wallet size={16} color="#34d399" />;
      case 'WITHDRAWAL':
        return <ArrowUpRight size={16} color="#fbbf24" />;
      case 'MINING':
        return <Zap size={16} color="#38bdf8" />;
      case 'REFERRAL':
        return <Users size={16} color="#c084fc" />;
      default:
        return <Info size={16} color="#818cf8" />;
    }
  };

  const formatRelativeTime = (dateStr: string) => {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  return (
    <div ref={dropdownRef} style={{ position: 'relative' }}>
      {/* Bell Button with Unread Badge */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn-secondary"
        style={{
          padding: '10px 14px',
          position: 'relative',
          background: isOpen ? 'rgba(56, 189, 248, 0.15)' : 'rgba(15, 23, 42, 0.8)',
          borderColor: isOpen ? '#38bdf8' : 'var(--glass-border)',
        }}
      >
        <Bell size={18} color={unreadCount > 0 ? '#38bdf8' : '#cbd5e1'} />
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              background: '#ef4444',
              color: '#ffffff',
              fontSize: '0.7rem',
              fontWeight: 800,
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 10px rgba(239, 68, 68, 0.6)',
              animation: 'pulse 2s infinite',
            }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Smart Glassmorphic Notification Drawer */}
      {isOpen && (
        <div
          className="glass-card"
          style={{
            position: 'absolute',
            top: '50px',
            right: isRtl ? 'auto' : 0,
            left: isRtl ? 0 : 'auto',
            width: '360px',
            maxHeight: '460px',
            padding: 0,
            zIndex: 1000,
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
            borderColor: 'rgba(56, 189, 248, 0.3)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '16px 20px',
              borderBottom: '1px solid var(--glass-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'rgba(15, 23, 42, 0.95)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Bell size={16} color="#38bdf8" />
              <span style={{ fontWeight: 800, fontSize: '0.95rem' }}>Notifications</span>
              {unreadCount > 0 && (
                <span className="badge badge-active" style={{ fontSize: '0.7rem', padding: '2px 8px' }}>
                  {unreadCount} New
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#38bdf8',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <CheckCheck size={14} /> Mark all read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div style={{ overflowY: 'auto', flex: 1, padding: '8px' }}>
            {notifications.length > 0 ? (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '10px',
                    marginBottom: '6px',
                    cursor: 'pointer',
                    background: n.isRead ? 'transparent' : 'rgba(56, 189, 248, 0.08)',
                    border: n.isRead ? '1px solid transparent' : '1px solid rgba(56, 189, 248, 0.2)',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(56, 189, 248, 0.15)')}
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = n.isRead ? 'transparent' : 'rgba(56, 189, 248, 0.08)')
                  }
                >
                  <div
                    style={{
                      padding: '8px',
                      borderRadius: '8px',
                      background: 'rgba(15, 23, 42, 0.8)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {getTypeIcon(n.type)}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.85rem', color: n.isRead ? 'var(--text-muted)' : '#ffffff' }}>
                        {n.title}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-sub)' }}>{formatRelativeTime(n.createdAt)}</span>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0, lineHeight: '1.4' }}>{n.message}</p>
                  </div>

                  <ChevronRight size={14} color="var(--text-sub)" style={{ marginTop: '4px' }} />
                </div>
              ))
            ) : (
              <div style={{ padding: '30px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                No notifications right now.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
