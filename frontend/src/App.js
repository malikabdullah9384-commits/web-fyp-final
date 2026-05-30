import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

import Login  from './pages/Login';
import Register from './pages/Register';

import SuperAdminDashboard  from './pages/superadmin/SuperAdminDashboard';
import ManageAdmins         from './pages/superadmin/ManageAdmins';
import ManagePermissions    from './pages/superadmin/ManagePermissions';
import AuditLogs            from './pages/superadmin/AuditLogs';

import AdminDashboard      from './pages/admin/AdminDashboard';
import ManageSupervisors   from './pages/admin/ManageSupervisors';
import ManageStudents      from './pages/admin/ManageStudents';

import StudentDashboard    from './pages/student/StudentDashboard';
import SubmitProposal      from './pages/student/SubmitProposal';
import StudentProgress     from './pages/student/StudentProgress';

import SupervisorDashboard from './pages/supervisor/SupervisorDashboard';
import ReviewProposals     from './pages/supervisor/ReviewProposals';
import SupervisorProgress  from './pages/supervisor/SupervisorProgress';

import './App.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/superadmin"
            element={
              <ProtectedRoute role="superadmin">
                <Layout role="superadmin" />
              </ProtectedRoute>
            }
          >
            <Route index             element={<SuperAdminDashboard />} />
            <Route path="admins"     element={<ManageAdmins />} />
            <Route path="permissions" element={<ManagePermissions />} />
            <Route path="audit"      element={<AuditLogs />} />
          </Route>

          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={['admin', 'superadmin']}>
                <Layout role="admin" />
              </ProtectedRoute>
            }
          >
            <Route index               element={<AdminDashboard />} />
            <Route path="supervisors"  element={<ManageSupervisors />} />
            <Route path="students"     element={<ManageStudents />} />
          </Route>

          <Route
            path="/student"
            element={
              <ProtectedRoute role="student">
                <Layout role="student" />
              </ProtectedRoute>
            }
          >
            <Route index           element={<StudentDashboard />} />
            <Route path="proposal" element={<SubmitProposal />} />
            <Route path="progress" element={<StudentProgress />} />
          </Route>

          <Route
            path="/supervisor"
            element={
              <ProtectedRoute role="supervisor">
                <Layout role="supervisor" />
              </ProtectedRoute>
            }
          >
            <Route index            element={<SupervisorDashboard />} />
            <Route path="proposals" element={<ReviewProposals />} />
            <Route path="progress"  element={<SupervisorProgress />} />
          </Route>

          <Route path="/"  element={<Navigate to="/login" replace />} />
          <Route path="*"  element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
