import { useState, useEffect } from 'react';
import api from '../../services/api';
import './Supervisor.css';

function SupervisorProgress() {
  const [students,     setStudents]     = useState([]);
  const [selected,     setSelected]     = useState(null);
  const [progressList, setProgressList] = useState([]);
  const [feedbacks,    setFeedbacks]    = useState({});
  const [loadingProg,  setLoadingProg]  = useState(false);
  const [error,        setError]        = useState('');
  const [success,      setSuccess]      = useState('');

  useEffect(() => {
    api.get('/supervisor/students').then(({ data }) => setStudents(data));
  }, []);

  const loadProgress = (student) => {
    setSelected(student);
    setProgressList([]);
    setFeedbacks({});
    setError('');
    setLoadingProg(true);
    api.get(`/supervisor/progress/${student._id}`)
      .then(({ data }) => setProgressList(data))
      .catch(() => setError('Failed to load progress'))
      .finally(() => setLoadingProg(false));
  };

  const giveFeedback = async (progressId) => {
    const feedback = feedbacks[progressId]?.trim();
    if (!feedback) { setError('Please enter feedback before submitting.'); return; }
    setError('');
    try {
      const { data } = await api.put(`/supervisor/progress/${progressId}/feedback`, { feedback });
      setProgressList((prev) => prev.map((p) => (p._id === progressId ? { ...p, ...data } : p)));
      setFeedbacks((f) => ({ ...f, [progressId]: '' }));
      setSuccess('Feedback submitted');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit feedback');
    }
  };

  return (
    <div>
      <h2 className="page-title">Student Progress</h2>

      <div className="progress-layout">
        <div className="student-list-panel">
          <h3>Select Student</h3>
          {students.length === 0 ? (
            <p className="empty-text">No students assigned.</p>
          ) : (
            students.map((s) => (
              <button
                key={s._id}
                className={`student-list-item ${selected?._id === s._id ? 'student-list-item--active' : ''}`}
                onClick={() => loadProgress(s)}
              >
                <div className="sli-avatar">{s.name[0]}</div>
                <div>
                  <strong>{s.name}</strong>
                  {s.rollNo && <p>Roll: {s.rollNo}</p>}
                </div>
              </button>
            ))
          )}
        </div>

        <div className="progress-panel">
          {!selected ? (
            <div className="progress-placeholder">
              <p>Select a student to view their progress reports</p>
            </div>
          ) : (
            <>
              <h3>Progress — {selected.name}</h3>

              {error   && <div className="alert-error">{error}</div>}
              {success && <div className="alert-success">{success}</div>}

              {loadingProg ? (
                <p className="loading-text">Loading…</p>
              ) : progressList.length === 0 ? (
                <p className="empty-text">No progress reports submitted yet.</p>
              ) : (
                <div className="progress-list">
                  {progressList.map((p) => (
                    <div key={p._id} className={`progress-card progress-${p.status}`}>
                      <div className="progress-card-header">
                        <span className="week-badge">Week {p.weekNumber}</span>
                        <span className={`badge badge-${p.status}`}>
                          {p.status === 'reviewed' ? '✓ Reviewed' : '⏳ Pending'}
                        </span>
                        <span className="progress-date">
                          {new Date(p.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <p className="progress-desc">{p.description}</p>

                      {p.file && (
                        <a href={`http://localhost:5000/uploads/${p.file}`}
                          target="_blank" rel="noreferrer" className="file-link">
                          View File
                        </a>
                      )}

                      {p.feedback ? (
                        <div className="feedback-box">
                          <strong>Your Feedback:</strong>
                          <p>{p.feedback}</p>
                          {p.reviewedAt && (
                            <small>Reviewed: {new Date(p.reviewedAt).toLocaleDateString()}</small>
                          )}
                        </div>
                      ) : (
                        <div className="feedback-form">
                          <textarea
                            rows={3}
                            placeholder="Write your feedback…"
                            value={feedbacks[p._id] || ''}
                            onChange={(e) => setFeedbacks((f) => ({ ...f, [p._id]: e.target.value }))}
                            style={{ resize: 'vertical', marginBottom: 8 }}
                          />
                          <button className="btn-approve" onClick={() => giveFeedback(p._id)}>
                            Submit Feedback
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default SupervisorProgress;
