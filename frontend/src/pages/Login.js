import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const ROLE_PATHS = {
  superadmin: '/superadmin',
  admin:      '/admin',
  supervisor: '/supervisor',
  student:    '/student',
};

function Login() {
  const [form,    setForm]    = useState({ email: '', password: '' });
  const [errors,  setErrors]  = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const { login } = useAuth();
  const navigate  = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    setApiError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fieldErrors = {};
    if (!form.email.trim())        fieldErrors.email    = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) fieldErrors.email = 'Enter a valid email';
    if (!form.password)            fieldErrors.password = 'Password is required';
    else if (form.password.length < 6) fieldErrors.password = 'Minimum 6 characters';

    if (Object.keys(fieldErrors).length) {
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    setApiError('');
    try {
      const user = await login(form.email, form.password);
      navigate(ROLE_PATHS[user.role] || '/login');
    } catch (err) {
      setApiError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">FUI</div>
          <h1>FYP Management System</h1>
          <p>Foundation University Islamabad</p>
        </div>

        <h2>Sign In</h2>

        {apiError && <div className="login-error" role="alert">{apiError}</div>}

        <form onSubmit={handleSubmit} className="login-form" noValidate>
          <div className={`form-group ${errors.email ? 'has-error' : ''}`}>
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="you@fui.edu.pk"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
              autoFocus
            />
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>

          <div className={`form-group ${errors.password ? 'has-error' : ''}`}>
            <label htmlFor="password">Password</label>
            <div className="input-with-toggle">
              <input
                id="password"
                name="password"
                type={showPwd ? 'text' : 'password'}
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                autoComplete="current-password"
              />
              <button type="button" className="pwd-toggle" onClick={() => setShowPwd((v) => !v)}>
                {showPwd ? 'Hide' : 'Show'}
              </button>
            </div>
            {errors.password && <span className="field-error">{errors.password}</span>}
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="login-note">
          New student?{' '}
          <Link to="/register" className="login-link">Create an account</Link>
        </p>
        <p className="login-note">
          Supervisors &amp; Admins — contact the admin for credentials.
        </p>
      </div>
    </div>
  );
}

export default Login;
