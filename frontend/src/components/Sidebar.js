import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

const NAV_LINKS = {
  superadmin: [
    { path: '/superadmin',             label: '📊 Dashboard' },
    { path: '/superadmin/admins',      label: '👥 Manage Admins' },
    { path: '/superadmin/permissions', label: '🔐 Permissions' },
    { path: '/superadmin/audit',       label: '📋 Audit Logs' },
  ],
  admin: [
    { path: '/admin',              label: '📊 Dashboard' },
    { path: '/admin/supervisors',  label: '👨‍🏫 Supervisors' },
    { path: '/admin/students',     label: '🎓 Students' },
  ],
  supervisor: [
    { path: '/supervisor',            label: '📊 Dashboard' },
    { path: '/supervisor/proposals',  label: '📄 Proposals' },
    { path: '/supervisor/progress',   label: '📈 Progress' },
  ],
  student: [
    { path: '/student',           label: '📊 Dashboard' },
    { path: '/student/proposal',  label: '📄 My Proposal' },
    { path: '/student/progress',  label: '📈 My Progress' },
  ],
};

const ROLE_LABELS = {
  superadmin: 'Super Admin',
  admin:      'Admin',
  supervisor: 'Supervisor',
  student:    'Student',
};

function Sidebar({ role }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const links = NAV_LINKS[role] || [];

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">FUI</div>
        <p className="sidebar-title">FYP System</p>
        <span className={`sidebar-role-badge role-${role}`}>{ROLE_LABELS[role]}</span>
      </div>

      <nav className="sidebar-nav">
        {links.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            end
            className={({ isActive }) => (isActive ? 'nav-link nav-link--active' : 'nav-link')}
          >
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="user-avatar">{user?.name?.[0]?.toUpperCase() || '?'}</div>
          <div className="user-info">
            <span className="user-name">{user?.name || 'User'}</span>
            <span className="user-email">{user?.email || ''}</span>
          </div>
        </div>
        <button className="logout-btn" onClick={handleLogout}>Sign Out</button>
      </div>
    </div>
  );
}

export default Sidebar;
