import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const INITIAL = { name: '', email: '', password: '', confirm: '', rollNo: '', department: '', batch: '', semester: '' };

function Register() {
  const [form,     setForm]     = useState(INITIAL);
  const [errors,   setErrors]   = useState({});
  const [apiError, setApiError] = useState('');
  const [loading,  setLoading]  = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    setApiError('');
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim())    e.name    = 'Full name is required';
    if (!form.email.trim())   e.email   = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.password)                                e.password = 'Password is required';
    else if (form.password.length < 6)                e.password = 'Minimum 6 characters';
    else if (!/[A-Z]/.test(form.password))            e.password = 'Must contain at least one uppercase letter';
    else if (!/[0-9]/.test(form.password))            e.password = 'Must contain at least one number';
    if (!e.password && form.password !== form.confirm) e.confirm = 'Passwords do not match';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fieldErrors = validate();
    if (Object.keys(fieldErrors).length) { setErrors(fieldErrors); return; }

    setLoading(true);
    setApiError('');
    try {
      await register({
        name:       form.name.trim(),
        email:      form.email.trim(),
        password:   form.password,
        rollNo:     form.rollNo.trim(),
        department: form.department.trim(),
        batch:      form.batch.trim(),
        semester:   form.semester.trim(),
      });
      navigate('/student');
    } catch (err) {
      setApiError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card login-card--wide">
        <div className="login-header">
          <div className="login-logo">FUI</div>
          <h1>FYP Management System</h1>
          <p>Foundation University Islamabad</p>
        </div>

        <h2>Student Registration</h2>

        {apiError && <div className="login-error" role="alert">{apiError}</div>}

        <form onSubmit={handleSubmit} className="login-form" noValidate>
          <div className="form-row">
            <div className={`form-group ${errors.name ? 'has-error' : ''}`}>
              <label htmlFor="name">Full Name *</label>
              <input id="name" name="name" type="text" placeholder="Muhammad Abdullah"
                value={form.name} onChange={handleChange} autoFocus />
              {errors.name && <span className="field-error">{errors.name}</span>}
            </div>

            <div className={`form-group ${errors.email ? 'has-error' : ''}`}>
              <label htmlFor="email">Email Address *</label>
              <input id="email" name="email" type="email" placeholder="you@fui.edu.pk"
                value={form.email} onChange={handleChange} autoComplete="email" />
              {errors.email && <span className="field-error">{errors.email}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className={`form-group ${errors.password ? 'has-error' : ''}`}>
              <label htmlFor="password">Password *</label>
              <input id="password" name="password" type="password" placeholder="Min. 6 characters"
                value={form.password} onChange={handleChange} autoComplete="new-password" />
              {errors.password && <span className="field-error">{errors.password}</span>}
            </div>

            <div className={`form-group ${errors.confirm ? 'has-error' : ''}`}>
              <label htmlFor="confirm">Confirm Password *</label>
              <input id="confirm" name="confirm" type="password" placeholder="Repeat password"
                value={form.confirm} onChange={handleChange} autoComplete="new-password" />
              {errors.confirm && <span className="field-error">{errors.confirm}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="rollNo">Roll Number</label>
              <input id="rollNo" name="rollNo" type="text" placeholder="e.g. 025"
                value={form.rollNo} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label htmlFor="department">Department</label>
              <input id="department" name="department" type="text" placeholder="e.g. IET"
                value={form.department} onChange={handleChange} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="batch">Batch Year</label>
              <input id="batch" name="batch" type="text" placeholder="e.g. 2022"
                value={form.batch} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label htmlFor="semester">Semester</label>
              <input id="semester" name="semester" type="text" placeholder="e.g. 4A"
                value={form.semester} onChange={handleChange} />
            </div>
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="login-note">
          Already have an account?{' '}
          <Link to="/login" className="login-link">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
