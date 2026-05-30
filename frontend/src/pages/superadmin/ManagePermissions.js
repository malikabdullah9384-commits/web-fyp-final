import { useState, useEffect } from 'react';
import api from '../../services/api';
import './SuperAdmin.css';

const PERMISSION_GROUPS = {
  'User Management': [
    'users:view', 'users:create', 'users:edit', 'users:delete',
  ],
  'Supervisor Management': [
    'supervisors:view', 'supervisors:create', 'supervisors:edit', 'supervisors:delete',
  ],
  'Student Management': [
    'students:view', 'students:create', 'students:edit', 'students:delete', 'students:assign',
  ],
  'Project Management': [
    'projects:view', 'projects:create', 'projects:edit', 'projects:delete', 'projects:approve',
  ],
  'Progress Management': [
    'progress:view', 'progress:create', 'progress:review',
  ],
  'System': [
    'system:admins', 'system:permissions', 'system:audit', 'system:settings',
  ],
};

const ROLES = ['admin', 'supervisor', 'student'];

function ManagePermissions() {
  const [data,     setData]     = useState(null);
  const [active,   setActive]   = useState('admin');
  const [selected, setSelected] = useState({});
  const [saving,   setSaving]   = useState(false);
  const [msg,      setMsg]      = useState({ type: '', text: '' });

  useEffect(() => {
    api.get('/superadmin/permissions').then(({ data }) => {
      setData(data);
      setSelected(data.rolePermissions);
    });
  }, []);

  const toggle = (role, perm) => {
    setSelected((prev) => {
      const perms = prev[role] || [];
      return {
        ...prev,
        [role]: perms.includes(perm) ? perms.filter((p) => p !== perm) : [...perms, perm],
      };
    });
  };

  const selectAll = (role, groupPerms) => {
    setSelected((prev) => {
      const current = prev[role] || [];
      const allHave = groupPerms.every((p) => current.includes(p));
      return {
        ...prev,
        [role]: allHave
          ? current.filter((p) => !groupPerms.includes(p))
          : [...new Set([...current, ...groupPerms])],
      };
    });
  };

  const save = async () => {
    setSaving(true);
    setMsg({ type: '', text: '' });
    try {
      await api.put(`/superadmin/permissions/roles/${active}`, { permissions: selected[active] || [] });
      setMsg({ type: 'success', text: `Permissions saved for ${active}` });
      setTimeout(() => setMsg({ type: '', text: '' }), 3000);
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to save' });
    } finally {
      setSaving(false);
    }
  };

  const reset = async () => {
    if (!window.confirm(`Reset ${active} permissions to defaults?`)) return;
    try {
      const { data: res } = await api.post(`/superadmin/permissions/roles/${active}/reset`);
      setSelected((prev) => ({ ...prev, [active]: res.permissions }));
      setMsg({ type: 'success', text: `${active} permissions reset to defaults` });
      setTimeout(() => setMsg({ type: '', text: '' }), 3000);
    } catch {
      setMsg({ type: 'error', text: 'Reset failed' });
    }
  };

  if (!data) return <div className="page-loading">Loading…</div>;

  const activePerms = selected[active] || [];

  return (
    <div className="sa-page">
      <div className="page-header">
        <h1>Permission Management</h1>
        <p>Control what each role can access across the system</p>
      </div>

      {msg.text && (
        <div className={`alert alert-${msg.type}`}>{msg.text}</div>
      )}

      <div className="perm-layout">
        <div className="role-tabs">
          {ROLES.map((r) => (
            <button key={r} className={`role-tab ${active === r ? 'role-tab--active' : ''}`}
              onClick={() => setActive(r)}>
              {r.charAt(0).toUpperCase() + r.slice(1)}
              <span className="perm-count">{(selected[r] || []).length}</span>
            </button>
          ))}
        </div>

        <div className="perm-panel">
          <div className="perm-panel-header">
            <h3>Permissions for <span className="role-highlight">{active}</span></h3>
            <div className="perm-actions">
              <button className="btn-sm btn-outline" onClick={reset}>Reset Defaults</button>
              <button className="btn-primary" onClick={save} disabled={saving}>
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </div>

          {Object.entries(PERMISSION_GROUPS).map(([group, perms]) => {
            const allChecked = perms.every((p) => activePerms.includes(p));
            const someChecked = perms.some((p) => activePerms.includes(p));
            return (
              <div key={group} className="perm-group">
                <div className="perm-group-header">
                  <label className="perm-group-label">
                    <input
                      type="checkbox"
                      checked={allChecked}
                      ref={(el) => { if (el) el.indeterminate = !allChecked && someChecked; }}
                      onChange={() => selectAll(active, perms)}
                    />
                    <span>{group}</span>
                  </label>
                </div>
                <div className="perm-items">
                  {perms.map((perm) => (
                    <label key={perm} className="perm-item">
                      <input
                        type="checkbox"
                        checked={activePerms.includes(perm)}
                        onChange={() => toggle(active, perm)}
                      />
                      <span className="perm-key">{perm}</span>
                    </label>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default ManagePermissions;
