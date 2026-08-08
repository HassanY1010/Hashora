import React, { useEffect, useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { AdjustBalanceModal } from '../components/AdjustBalanceModal';
import { apiClient } from '../api/client';
import { useToast } from '../context/ToastContext';
import { UserCheck, ShieldAlert, PauseCircle, PlayCircle, DollarSign } from 'lucide-react';

export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUserForBalance, setSelectedUserForBalance] = useState<any | null>(null);
  const { showToast, showConfirm } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await apiClient.get('/api/users/admin/all');
      setUsers(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleBlock = (user: any) => {
    const isBlocked = user.status === 'BLOCKED';
    showConfirm({
      title: isBlocked ? 'Unblock User Account' : 'Block User Account',
      message: `Are you sure you want to ${isBlocked ? 'unblock' : 'block'} user ${user.email}?`,
      variant: isBlocked ? 'primary' : 'danger',
      onConfirm: async () => {
        try {
          await apiClient.put(`/api/users/admin/${user.id}/block`, { isBlocked: !isBlocked });
          showToast(`User ${user.email} status updated.`, 'info');
          fetchUsers();
        } catch (err: any) {
          showToast(err.message, 'error');
        }
      },
    });
  };

  const handleTogglePauseMining = (user: any) => {
    showConfirm({
      title: 'Toggle Mining Status',
      message: `Are you sure you want to pause/resume mining for ${user.email}?`,
      onConfirm: async () => {
        try {
          await apiClient.put(`/api/users/admin/${user.id}/pause-mining`, { isPaused: true });
          showToast(`Mining contracts updated for user.`, 'info');
          fetchUsers();
        } catch (err: any) {
          showToast(err.message, 'error');
        }
      },
    });
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />

      <main style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Users Management & Financial Control</h1>
          <p style={{ color: 'var(--text-muted)' }}>Search registered accounts, adjust wallet balances with audit logs, and manage access.</p>
        </div>

        <div className="glass-card" style={{ padding: '28px' }}>
          <div className="custom-table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>User Details</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Available Balance</th>
                  <th>Mining Balance</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <span style={{ display: 'block', fontWeight: 700 }}>{u.fullName}</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{u.email}</span>
                    </td>
                    <td><span className="badge badge-active">{u.role}</span></td>
                    <td>
                      <span className={`badge ${u.status === 'ACTIVE' ? 'badge-active' : 'badge-failed'}`}>{u.status}</span>
                    </td>
                    <td style={{ color: '#38bdf8', fontWeight: 700 }}>{u.wallet?.availableBalance || 0} USDT</td>
                    <td style={{ color: '#fbbf24', fontWeight: 700 }}>{u.wallet?.miningBalance || 0} USDT</td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => setSelectedUserForBalance(u)}
                          className="btn-primary"
                          style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                        >
                          <DollarSign size={14} /> Adjust Balance
                        </button>

                        <button
                          onClick={() => handleToggleBlock(u)}
                          className={u.status === 'BLOCKED' ? 'btn-success' : 'btn-danger'}
                          style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                        >
                          <ShieldAlert size={14} /> {u.status === 'BLOCKED' ? 'Unblock' : 'Block'}
                        </button>

                        <button
                          onClick={() => handleTogglePauseMining(u)}
                          className="btn-secondary"
                          style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                        >
                          <PauseCircle size={14} /> Pause Mining
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <AdjustBalanceModal
          isOpen={!!selectedUserForBalance}
          userId={selectedUserForBalance?.id || null}
          userName={selectedUserForBalance?.fullName || null}
          onClose={() => setSelectedUserForBalance(null)}
          onSuccess={fetchUsers}
        />
      </main>
    </div>
  );
};
