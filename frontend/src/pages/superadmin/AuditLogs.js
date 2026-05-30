import { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import './SuperAdmin.css';

const ACTION_LABELS = {
  LOGIN:                   'Login',
  LOGOUT:                  'Logout',
  REGISTER:                'Register',
  CREATE_ADMIN:            'Created Admin',
  UPDATE_ADMIN:            'Updated Admin',
  DELETE_ADMIN:            'Deleted Admin',
  UPDATE_ROLE_PERMISSIONS: 'Updated Role Permissions',
  UPDATE_USER_PERMISSIONS: 'Updated User Permissions',
};

function AuditLogs() {
  const [logs,    setLogs]    = useState([]);
  const [total,   setTotal]   = useState(0);
  const [page,    setPage]    = useState(1);
  const [pages,   setPages]   = useState(1);
  const [filters, setFilters] = useState({ action: '', role: '' });
  const [loading, setLoading] = useState(false);

  const fetchLogs = useCallback(() => {
    setLoading(true);
    const params = { page, limit: 20, ...filters };
    api.get('/superadmin/audit-logs', { params })
      .then(({ data }) => {
        setLogs(data.logs);
        setTotal(data.total);
        setPages(data.pages);
      })
      .finally(() => setLoading(false));
  }, [page, filters]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const handleFilter = (e) => {
    setFilters((p) => ({ ...p, [e.target.name]: e.target.value }));
    setPage(1);
  };

  return (
    <div className="sa-page">
      <div className="page-header">
        <h1>Audit Logs</h1>
        <p>{total} total events recorded</p>
      </div>

      <div className="filter-bar">
        <select name="action" value={filters.action} onChange={handleFilter} className="filter-select">
          <option value="">All Actions</option>
          {Object.keys(ACTION_LABELS).map((a) => (
            <option key={a} value={a}>{ACTION_LABELS[a]}</option>
          ))}
        </select>
        <select name="role" value={filters.role} onChange={handleFilter} className="filter-select">
          <option value="">All Roles</option>
          {['superadmin', 'admin', 'supervisor', 'student'].map((r) => (
            <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
          ))}
        </select>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Actor</th>
              <th>Role</th>
              <th>Action</th>
              <th>Target</th>
              <th>IP</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="empty-cell">Loading…</td></tr>
            ) : logs.length === 0 ? (
              <tr><td colSpan={6} className="empty-cell">No logs found</td></tr>
            ) : (
              logs.map((log) => (
                <tr key={log._id}>
                  <td>{new Date(log.createdAt).toLocaleString()}</td>
                  <td>{log.actor?.name || log.actorEmail || '—'}</td>
                  <td><span className={`role-badge role-${log.actorRole}`}>{log.actorRole}</span></td>
                  <td>{ACTION_LABELS[log.action] || log.action}</td>
                  <td>{log.target}{log.targetId ? ` (${log.targetId.slice(-6)})` : ''}</td>
                  <td>{log.ip || '—'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <div className="pagination">
          <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="btn-sm btn-outline">
            ← Prev
          </button>
          <span>Page {page} of {pages}</span>
          <button disabled={page >= pages} onClick={() => setPage((p) => p + 1)} className="btn-sm btn-outline">
            Next →
          </button>
        </div>
      )}
    </div>
  );
}

export default AuditLogs;
