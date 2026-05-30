import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import './Student.css';

const STATUS_COLOR = { pending: '#f57c00', approved: '#388e3c', rejected: '#d32f2f' };

function StudentDashboard() {
  const [profile, setProfile] = useState(null);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/student/profile'),
      api.get('/student/project'),
    ]).then(([p, proj]) => {
      setProfile(p.data);
      setProject(proj.data);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="loading-text">Loading…</p>;

  return (
    <div>
      <h2 className="page-title">Dashboard</h2>

      {profile && (
        <div className="profile-card">
          <div className="profile-avatar">{profile.name[0]}</div>
          <div className="profile-details">
            <h3>{profile.name}</h3>
            <p className="profile-email">{profile.email}</p>
            <div className="profile-grid">
              {profile.rollNo    && <div><span>Roll No</span><strong>{profile.rollNo}</strong></div>}
              {profile.department && <div><span>Department</span><strong>{profile.department}</strong></div>}
              {profile.batch     && <div><span>Batch</span><strong>{profile.batch}</strong></div>}
              {profile.semester  && <div><span>Semester</span><strong>{profile.semester}</strong></div>}
            </div>
          </div>
        </div>
      )}

      {profile && (
        <div className="supervisor-info">
          <h4>Assigned Supervisor</h4>
          {profile.supervisorId ? (
            <div className="sup-detail">
              <p><strong>{profile.supervisorId.name}</strong>
                {profile.supervisorId.designation && ` — ${profile.supervisorId.designation}`}
              </p>
              <p>{profile.supervisorId.email}</p>
              {profile.supervisorId.phone && <p>{profile.supervisorId.phone}</p>}
              {profile.supervisorId.field  && <p>Field: {profile.supervisorId.field}</p>}
            </div>
          ) : (
            <p className="no-supervisor">No supervisor assigned yet. Contact the admin.</p>
          )}
        </div>
      )}

      <div className="quick-actions">
        <Link to="/student/proposal" className="action-card">
          <span className="action-icon">📄</span>
          <span>My Proposal</span>
        </Link>
        <Link to="/student/progress" className="action-card">
          <span className="action-icon">📈</span>
          <span>Progress Reports</span>
        </Link>
      </div>

      {project ? (
        <div className="project-summary-card">
          <div className="project-summary-header">
            <h4>My FYP Proposal</h4>
            <span className="badge" style={{ background: STATUS_COLOR[project.status] }}>
              {project.status.toUpperCase()}
            </span>
          </div>
          <p className="project-title">{project.title}</p>
          {project.supervisorFeedback && (
            <div className="feedback-box">
              <strong>Supervisor Feedback:</strong>
              <p>{project.supervisorFeedback}</p>
            </div>
          )}
          {project.status === 'approved' && (
            <p className="success-text">Proposal approved — you can now submit weekly progress reports.</p>
          )}
        </div>
      ) : (
        <div className="project-summary-card empty-project">
          <p>No proposal submitted yet.</p>
          <Link to="/student/proposal" className="btn-submit" style={{ display: 'inline-block', marginTop: 10 }}>
            Submit Proposal
          </Link>
        </div>
      )}
    </div>
  );
}

export default StudentDashboard;
