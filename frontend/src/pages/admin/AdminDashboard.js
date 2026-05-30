import { useState, useEffect } from 'react';
import api from '../../services/api';
import './Admin.css';

function AdminDashboard() {
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    api.get('/admin/stats')
      .then(({ data }) => setStats(data))
      .catch(() => setError('Failed to load dashboard stats'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="loading-text">Loading stats…</p>;
  if (error)   return <p className="error-text">{error}</p>;

  const cards = [
    { label: 'Total Students',    value: stats.totalStudents,    color: '#1976d2' },
    { label: 'Total Supervisors', value: stats.totalSupervisors, color: '#f57c00' },
    { label: 'Total Projects',    value: stats.totalProjects,    color: '#388e3c' },
    { label: 'Pending Proposals', value: stats.pendingProjects,  color: '#7b1fa2' },
  ];

  return (
    <div>
      <h2 className="page-title">Dashboard</h2>
      <div className="stat-cards">
        {cards.map((card) => (
          <div key={card.label} className="stat-card" style={{ backgroundColor: card.color }}>
            <p className="stat-label">{card.label}</p>
            <p className="stat-value">{card.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminDashboard;
