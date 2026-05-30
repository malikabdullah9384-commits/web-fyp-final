import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import './SuperAdmin.css';

function StatCard({ label, value, color }) {
  return (
    <div className="stat-card" style={{ borderTop: `4px solid ${color}` }}>
      <span className="stat-value">{value ?? '—'}</span>
      <span className="stat-label">{label}</span>
    </div>
  );
}

function SuperAdminDashboard() {
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    api.get('/superadmin/dashboard')
      .then(({ data }) => setStats(data))
      .catch(() => setError('Failed to load dashboard data'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-loading">Loading…</div>;
  if (error)   return <div className="page-error">{error}</div>;

  const ACTION_LABELS = {
    LOGIN:                  'Logged in',
    LOGOUT:                 'Logged out',
    REGISTER:               'Registered',
    CREATE_ADMIN:           'Created admin',
    UPDATE_ADMIN:           'Updated admin',
    DELETE_ADMIN:           'Deleted admin',
    UPDATE_ROLE_PERMISSIONS:'Updated role permissions',
    UPDATE_USER_PERMISSIONS:'Updated user permissions',
  };

  return (
    <div className="sa-dashboard">
      <div className="page-header">
        <h1>Super Admin Dashboard</h1>
        <p>System overview and recent activity</p>
      </div>

      <div className="stats-grid">
        <StatCard label="Total Users"   value={stats.totalUsers}  color="#e91e63" />
        <StatCard label="Admins"        value={stats.admins}       color="#9c27b0" />
        <StatCard label="Supervisors"   value={stats.supervisors}  color="#3f51b5" />
        <StatCard label="Students"      value={stats.students}     color="#009688" />
        <StatCard label="Projects"      value={stats.projects}     color="#ff9800" />
        <StatCard label="Audit Events"  value={stats.auditCount}   color="#607d8b" />
      </div>

      <div className="sa-quick-links">
        <Link to="/superadmin/admins" className="quick-link-card">
          <span className="ql-icon">👥</span>
          <span>Manage Admins</span>
        </Link>
        <Link to="/superadmin/permissions" className="quick-link-card">
          <span className="ql-icon">🔐</span>
          <span>Manage Permissions</span>
        </Link>
        <Link to="/superadmin/audit" className="quick-link-card">
          <span className="ql-icon">📋</span>
          <span>Audit Logs</span>
        </Link>
      </div>

      <div className="sa-section">
        <h2>Recent Activity</h2>
        {stats.recentLogs?.length === 0 ? (
          <p className="empty-msg">No activity yet</p>
        ) : (
          <div className="activity-list">
            {stats.recentLogs?.map((log) => (
              <div key={log._id} className="activity-item">
                <div className="activity-actor">
                  <strong>{log.actor?.name || 'Unknown'}</strong>
                  <span className={`role-badge role-${log.actorRole}`}>{log.actorRole}</span>
                </div>
                <div className="activity-action">{ACTION_LABELS[log.action] || log.action}</div>
                <div className="activity-time">
                  {new Date(log.createdAt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default SuperAdminDashboard;
