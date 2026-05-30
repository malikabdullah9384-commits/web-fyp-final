import { useState, useEffect } from 'react';
import api from '../../services/api';
import './SuperAdmin.css';

const EMPTY_FORM = { name: '', email: '', password: '' };

function ManageAdmins() {
  const [admins,   setAdmins]   = useState([]);
  const [form,     setForm]     = useState(EMPTY_FORM);
  const [errors,   setErrors]   = useState({});
  const [apiError, setApiError] = useState('');
  const [success,  setSuccess]  = useState('');
  const [loading,  setLoading]  = useState(false);
  const [showForm, setShowForm] = useState(false);

  const fetchAdmins = () => {
    api.get('/superadmin/admins').then(({ data }) => setAdmins(data));
  };

  useEffect(() => { fetchAdmins(); }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: '' }));
    setApiError('');
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim())    e.name     = 'Name is required';
    if (!form.email.trim())   e.email    = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Invalid email';
    if (!form.password)       e.password = 'Password is required';
    else if (form.password.length < 6) e.password = 'Minimum 6 characters';
    return e;
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    const fieldErrors = validate();
    if (Object.keys(fieldErrors).length) { setErrors(fieldErrors); return; }

    setLoading(true);
    try {
      await api.post('/superadmin/admins', form);
      setForm(EMPTY_FORM);
      setShowForm(false);
      setSuccess('Admin created successfully');
      fetchAdmins();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setApiError(err.response?.data?.message || 'Failed to create admin');
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (admin) => {
    try {
      await api.put(`/superadmin/admins/${admin._id}`, { isActive: !admin.isActive });
      fetchAdmins();
    } catch {
      setApiError('Failed to update admin status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this admin? This cannot be undone.')) return;
    try {
      await api.delete(`/superadmin/admins/${id}`);
      fetchAdmins();
      setSuccess('Admin deleted');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setApiError(err.response?.data?.message || 'Failed to delete admin');
    }
  };

  return (
    <div className="sa-page">
      <div className="page-header">
        <h1>Manage Admins</h1>
        <button className="btn-primary" onClick={() => { setShowForm((v) => !v); setErrors({}); setApiError(''); }}>
          {showForm ? 'Cancel' : '+ New Admin'}
        </button>
      </div>

      {success  && <div className="alert alert-success">{success}</div>}
      {apiError && <div className="alert alert-error">{apiError}</div>}

      {showForm && (
        <div className="form-card">
          <h3>Create Admin Account</h3>
          <form onSubmit={handleAdd} className="sa-form" noValidate>
            <div className="form-row">
              <div className={`form-group ${errors.name ? 'has-error' : ''}`}>
                <label>Full Name *</label>
                <input name="name" value={form.name} onChange={handleChange} placeholder="Admin Name" />
                {errors.name && <span className="field-error">{errors.name}</span>}
              </div>
              <div className={`form-group ${errors.email ? 'has-error' : ''}`}>
                <label>Email *</label>
                <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="admin@fui.edu.pk" />
                {errors.email && <span className="field-error">{errors.email}</span>}
              </div>
            </div>
            <div className={`form-group ${errors.password ? 'has-error' : ''}`} style={{ maxWidth: 300 }}>
              <label>Password *</label>
              <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Min. 6 characters" />
              {errors.password && <span className="field-error">{errors.password}</span>}
            </div>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Creating…' : 'Create Admin'}
            </button>
          </form>
        </div>
      )}

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Email</th>
              <th>Status</th>
              <th>Last Login</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {admins.length === 0 ? (
              <tr><td colSpan={6} className="empty-cell">No admins found</td></tr>
            ) : (
              admins.map((a, i) => (
                <tr key={a._id}>
                  <td>{i + 1}</td>
                  <td>{a.name}</td>
                  <td>{a.email}</td>
                  <td>
                    <span className={`status-badge ${a.isActive ? 'active' : 'inactive'}`}>
                      {a.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>{a.lastLogin ? new Date(a.lastLogin).toLocaleDateString() : 'Never'}</td>
                  <td className="action-cell">
                    <button className={`btn-sm ${a.isActive ? 'btn-warn' : 'btn-success'}`} onClick={() => toggleActive(a)}>
                      {a.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button className="btn-sm btn-danger" onClick={() => handleDelete(a._id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ManageAdmins;
