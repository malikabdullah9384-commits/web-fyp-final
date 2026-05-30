import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute({ children, role, roles }) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  const allowed = roles ? roles.includes(user.role) : user.role === role;
  if (!allowed) {
    const paths = {
      superadmin: '/superadmin',
      admin:      '/admin',
      supervisor: '/supervisor',
      student:    '/student',
    };
    return <Navigate to={paths[user.role] || '/login'} replace />;
  }

  return children;
}

export default ProtectedRoute;
