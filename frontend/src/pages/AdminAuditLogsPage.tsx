import React, { useEffect, useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { apiClient } from '../api/client';
import { useLanguage } from '../context/LanguageContext';

export const AdminAuditLogsPage: React.FC = () => {
  const { t } = useLanguage();
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await apiClient.get('/api/admin/audit-logs');
      setLogs(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />

      <main style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>{t('auditLogsTitle')}</h1>
          <p style={{ color: 'var(--text-muted)' }}>{t('auditLogsSub')}</p>
        </div>

        <div className="glass-card" style={{ padding: '28px' }}>
          <div className="custom-table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>{t('dateTime')}</th>
                  <th>{t('adminUser')}</th>
                  <th>{t('actionPerformed')}</th>
                  <th>Target User ID</th>
                  <th>{t('description')}</th>
                </tr>
              </thead>
              <tbody>
                {logs.length > 0 ? (
                  logs.map((l) => (
                    <tr key={l.id}>
                      <td>{new Date(l.createdAt).toLocaleString()}</td>
                      <td style={{ fontWeight: 600 }}>{l.adminEmail}</td>
                      <td><span className="badge badge-pending">{l.action}</span></td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>{l.targetUserId || 'System'}</td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {JSON.stringify(l.details)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '30px' }}>
                      No audit log entries recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};
