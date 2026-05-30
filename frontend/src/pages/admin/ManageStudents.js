import { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import './Admin.css';

const EMPTY = { name: '', email: '', password: '', rollNo: '', department: '', batch: '', semester: '' };

function ManageStudents() {
  const [students,    setStudents]    = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const [form,        setForm]        = useState(EMPTY);
  const [errors,      setErrors]      = useState({});
  const [apiError,    setApiError]    = useState('');
  const [success,     setSuccess]     = useState('');
  const [showForm,    setShowForm]    = useState(false);

  const fetchData = useCallback(() => {
    Promise.all([
      api.get('/admin/students'),
      api.get('/admin/supervisors'),
    ]).then(([s, sv]) => {
      setStudents(s.data);
      setSupervisors(sv.data);
    });
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

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
      await api.post('/admin/students', form);
      setForm(EMPTY);
      setShowForm(false);
      setSuccess('Student added');
      fetchData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setApiError(err.response?.data?.message || 'Failed to add student');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this student?')) return;
    try {
      await api.delete(`/admin/students/${id}`);
      fetchData();
    } catch {}
  };

  const handleAssign = async (studentId, supervisorId) => {
    if (!supervisorId) return;
    try {
      await api.post('/admin/assign', { studentId, supervisorId });
      fetchData();
      setSuccess('Supervisor assigned');
      setTimeout(() => setSuccess(''), 3000);
    } catch {}
  };

  return (
    <div>
      <div className="page-header-row">
        <h2 className="page-title">Students</h2>
        <button className="btn-add" onClick={() => { setShowForm((v) => !v); setErrors({}); setApiError(''); }}>
          {showForm ? 'Cancel' : '+ Add Student'}
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
                <input name="name" value={form.name} onChange={handleChange} placeholder="Muhammad Ali" />
                {errors.name && <span className="field-error">{errors.name}</span>}
              </div>
              <div className={`form-group ${errors.email ? 'has-error' : ''}`}>
                <label>Email *</label>
                <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="ali@fui.edu.pk" />
                {errors.email && <span className="field-error">{errors.email}</span>}
              </div>
              <div className={`form-group ${errors.password ? 'has-error' : ''}`}>
                <label>Password *</label>
                <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Min. 6 characters" />
                {errors.password && <span className="field-error">{errors.password}</span>}
              </div>
              <div className="form-group">
                <label>Roll Number</label>
                <input name="rollNo" value={form.rollNo} onChange={handleChange} placeholder="e.g. 025" />
              </div>
              <div className="form-group">
                <label>Department</label>
                <input name="department" value={form.department} onChange={handleChange} placeholder="e.g. IET" />
              </div>
              <div className="form-group">
                <label>Batch</label>
                <input name="batch" value={form.batch} onChange={handleChange} placeholder="e.g. 2022" />
              </div>
              <div className="form-group">
                <label>Semester</label>
                <input name="semester" value={form.semester} onChange={handleChange} placeholder="e.g. 4A" />
              </div>
            </div>
            <button type="submit" className="btn-add" style={{ marginTop: 12 }}>Add Student</button>
          </form>
        </div>
      )}

      <div className="cards-list">
        {students.length === 0 ? (
          <p className="empty-text">No students found. Add one above.</p>
        ) : (
          students.map((s) => (
            <div key={s._id} className="record-card">
              <div className="record-info">
                <h4>{s.name}</h4>
                <p>{s.email}</p>
                {s.rollNo && <p>Roll No: {s.rollNo}</p>}
                {s.department && (
                  <p>{s.department}{s.batch ? ` · ${s.batch}` : ''}{s.semester ? ` · ${s.semester}` : ''}</p>
                )}
                <p className="supervisor-line">
                  Supervisor:{' '}
                  {s.supervisorId
                    ? <strong>{s.supervisorId.name}</strong>
                    : <span className="unassigned">Not assigned</span>
                  }
                </p>
              </div>
              <div className="record-actions">
                <select
                  className="assign-select"
                  defaultValue=""
                  onChange={(e) => handleAssign(s._id, e.target.value)}
                >
                  <option value="" disabled>Assign supervisor</option>
                  {supervisors.filter((sv) => sv.isActive).map((sv) => (
                    <option key={sv._id} value={sv._id}>{sv.name}</option>
                  ))}
                </select>
                <button className="btn-delete" onClick={() => handleDelete(s._id)}>Delete</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ManageStudents;
