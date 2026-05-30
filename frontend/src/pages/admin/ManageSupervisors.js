import { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import './Admin.css';

const EMPTY = { name: '', email: '', password: '', designation: '', field: '', phone: '' };

function ManageSupervisors() {
  const [supervisors, setSupervisors] = useState([]);
  const [form,        setForm]        = useState(EMPTY);
  const [errors,      setErrors]      = useState({});
  const [apiError,    setApiError]    = useState('');
  const [success,     setSuccess]     = useState('');
  const [showForm,    setShowForm]    = useState(false);

  const fetchSupervisors = useCallback(() => {
    api.get('/admin/supervisors').then(({ data }) => setSupervisors(data));
  }, []);

  useEffect(() => { fetchSupervisors(); }, [fetchSupervisors]);

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
    else if (form.password.length < 6) e.password = 'Min. 6 characters';
    return e;
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    const fieldErrors = validate();
    if (Object.keys(fieldErrors).length) { setErrors(fieldErrors); return; }
    try {
      await api.post('/admin/supervisors', form);
      setForm(EMPTY);
      setShowForm(false);
      setSuccess('Supervisor added');
      fetchSupervisors();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setApiError(err.response?.data?.message || 'Failed to add supervisor');
    }
  };

  const handleToggle = async (id) => {
    try {
      await api.put(`/admin/supervisors/${id}/toggle`, {});
      fetchSupervisors();
    } catch {}
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this supervisor?')) return;
    try {
      await api.delete(`/admin/supervisors/${id}`);
      fetchSupervisors();
    } catch {}
  };

  return (
    <div>
      <div className="page-header-row">
        <h2 className="page-title">Supervisors</h2>
        <button className="btn-add" onClick={() => { setShowForm((v) => !v); setErrors({}); setApiError(''); }}>
          {showForm ? 'Cancel' : '+ Add Supervisor'}
        </button>
      </div>

      {success  && <div className="alert-success">{success}</div>}
      {apiError && <div className="alert-error">{apiError}</div>}

      {showForm && (
        <div className="form-card">
          <form onSubmit={handleAdd} noValidate>
            <div className="form-row-grid">
              <div className={`form-group ${errors.name ? 'has-error' : ''}`}>
                <label>Full Name *</label>
                <input name="name" value={form.name} onChange={handleChange} placeholder="Dr. John Doe" />
                {errors.name && <span className="field-error">{errors.name}</span>}
              </div>
              <div className={`form-group ${errors.email ? 'has-error' : ''}`}>
                <label>Email *</label>
                <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="john@fui.edu.pk" />
                {errors.email && <span className="field-error">{errors.email}</span>}
              </div>
              <div className={`form-group ${errors.password ? 'has-error' : ''}`}>
                <label>Password *</label>
                <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Min. 6 characters" />
                {errors.password && <span className="field-error">{errors.password}</span>}
              </div>
              <div className="form-group">
                <label>Designation</label>
                <input name="designation" value={form.designation} onChange={handleChange} placeholder="e.g. Lecturer" />
              </div>
              <div className="form-group">
                <label>Field</label>
                <input name="field" value={form.field} onChange={handleChange} placeholder="e.g. AI, Software Engineering" />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input name="phone" value={form.phone} onChange={handleChange} placeholder="03XXXXXXXXX" />
              </div>
            </div>
            <button type="submit" className="btn-add" style={{ marginTop: 12 }}>Add Supervisor</button>
          </form>
        </div>
      )}

      <div className="cards-list">
        {supervisors.length === 0 ? (
          <p className="empty-text">No supervisors found. Add one above.</p>
        ) : (
          supervisors.map((s) => (
            <div key={s._id} className="record-card">
              <div className="record-info">
                <h4>{s.name} {s.designation && <span className="muted">({s.designation})</span>}</h4>
                <p>{s.email}</p>
                {s.phone && <p>{s.phone}</p>}
                {s.field && <p>Field: {s.field}</p>}
                <span className={s.isActive ? 'badge badge-active' : 'badge badge-inactive'}>
                  {s.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="record-actions">
                <button className="btn-toggle" onClick={() => handleToggle(s._id)}>
                  {s.isActive ? 'Deactivate' : 'Activate'}
                </button>
                <button className="btn-delete" onClick={() => handleDelete(s._id)}>Delete</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ManageSupervisors;
