import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import './Supervisor.css';

function SupervisorDashboard() {
  const [profile,      setProfile]      = useState(null);
  const [students,     setStudents]     = useState([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading,      setLoading]      = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/supervisor/profile'),
      api.get('/supervisor/students'),
      api.get('/supervisor/proposals'),
    ]).then(([p, s, pr]) => {
      setProfile(p.data);
      setStudents(s.data);
      setPendingCount(pr.data.filter((x) => x.status === 'pending').length);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="loading-text">Loading…</p>;

  return (
    <div>
      <h2 className="page-title">Dashboard</h2>

      {profile && (
        <div className="sup-profile-card">
          <div className="sup-avatar">{profile.name[0]}</div>
          <div>
            <h3>{profile.name}</h3>
            {profile.designation && <p className="sup-designation">{profile.designation}</p>}
            <p>{profile.email}</p>
            {profile.phone && <p>{profile.phone}</p>}
            {profile.field  && <p>Field: <strong>{profile.field}</strong></p>}
          </div>
        </div>
      )}

      <div className="sup-stat-row">
        <div className="sup-stat-card" style={{ background: '#1976d2' }}>
          <p>Assigned Students</p>
          <strong>{students.length}</strong>
        </div>
        <div className="sup-stat-card" style={{ background: '#f57c00' }}>
          <p>Pending Proposals</p>
          <strong>{pendingCount}</strong>
        </div>
      </div>

      <div className="quick-actions">
        <Link to="/supervisor/proposals" className="action-card">
          <span className="action-icon">📄</span>
          <span>Review Proposals</span>
        </Link>
        <Link to="/supervisor/progress" className="action-card">
          <span className="action-icon">📈</span>
          <span>Student Progress</span>
        </Link>
      </div>

      <h3 className="section-label">Assigned Students</h3>
      <div className="student-grid">
        {students.length === 0 ? (
          <p className="empty-text">No students assigned yet.</p>
        ) : (
          students.map((s) => (
            <div key={s._id} className="student-mini-card">
              <div className="student-mini-avatar">{s.name[0]}</div>
              <h4>{s.name}</h4>
              {s.rollNo     && <p>Roll: {s.rollNo}</p>}
              {s.department && <p>{s.department}</p>}
              {s.semester   && <p>Sem: {s.semester}</p>}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default SupervisorDashboard;
