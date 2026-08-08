import React, { useEffect, useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { apiClient } from '../api/client';
import { Plus, Edit, Trash2 } from 'lucide-react';

export const AdminPlansPage: React.FC = () => {
  const [plans, setPlans] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('100');
  const [hashrate, setHashrate] = useState('700');
  const [durationDays, setDurationDays] = useState('90');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const res = await apiClient.get('/api/plans');
      setPlans(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiClient.post('/api/plans', {
        name,
        price: parseFloat(price),
        hashrate: parseInt(hashrate),
        durationDays: parseInt(durationDays),
        description,
      });
      setName('');
      setDescription('');
      fetchPlans();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />

      <main style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Mining Plans Manager</h1>
          <p style={{ color: 'var(--text-muted)' }}>Create, edit, or configure cloud mining packages offered to users.</p>
        </div>

        {/* Create Plan Form */}
        <div className="glass-card" style={{ padding: '28px', marginBottom: '32px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '20px' }}>Create New Mining Package</h3>

          <form onSubmit={handleCreatePlan} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div className="input-group">
              <label className="input-label">Plan Name</label>
              <input type="text" className="input-field" placeholder="e.g. Gold Plan" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>

            <div className="input-group">
              <label className="input-label">Price (USDT)</label>
              <input type="number" step="any" className="input-field" value={price} onChange={(e) => setPrice(e.target.value)} required />
            </div>

            <div className="input-group">
              <label className="input-label">Hashrate (MH/s)</label>
              <input type="number" className="input-field" value={hashrate} onChange={(e) => setHashrate(e.target.value)} required />
            </div>

            <div className="input-group">
              <label className="input-label">Duration (Days)</label>
              <input type="number" className="input-field" value={durationDays} onChange={(e) => setDurationDays(e.target.value)} required />
            </div>

            <div className="input-group" style={{ gridColumn: '1 / -1' }}>
              <label className="input-label">Description</label>
              <input type="text" className="input-field" placeholder="Professional cloud mining contract description" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>

            <button type="submit" className="btn-primary" disabled={loading} style={{ gridColumn: '1 / -1', padding: '12px', justifyContent: 'center' }}>
              <Plus size={18} /> {loading ? 'Creating Plan...' : 'Create Mining Plan'}
            </button>
          </form>
        </div>

        {/* Existing Plans Table */}
        <div className="glass-card" style={{ padding: '28px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '20px' }}>Active Mining Catalog</h3>

          <div className="custom-table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Plan Name</th>
                  <th>Price</th>
                  <th>Hashrate</th>
                  <th>Duration</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {plans.map((p) => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 700 }}>{p.name}</td>
                    <td style={{ color: '#38bdf8', fontWeight: 700 }}>{p.price} USDT</td>
                    <td style={{ fontWeight: 700 }}>{p.hashrate} MH/s</td>
                    <td>{p.durationDays} Days</td>
                    <td><span className="badge badge-active">{p.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};
