import { useState, useEffect } from 'react';
import api from '../../services/api';
import './Supervisor.css';

const STATUS_COLOR = { pending: '#f57c00', approved: '#388e3c', rejected: '#d32f2f' };

function ReviewProposals() {
  const [proposals, setProposals] = useState([]);
  const [feedbacks, setFeedbacks] = useState({});
  const [error,     setError]     = useState('');
  const [success,   setSuccess]   = useState('');
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    api.get('/supervisor/proposals')
      .then(({ data }) => setProposals(data))
      .finally(() => setLoading(false));
  }, []);

  const handleReview = async (id, status) => {
    const feedback = feedbacks[id]?.trim() || '';
    if (status === 'rejected' && !feedback) {
      setError('Feedback is required when rejecting a proposal.');
      return;
    }
    setError('');
    try {
      const { data } = await api.put(`/supervisor/proposals/${id}/review`, { status, feedback });
      setProposals((prev) => prev.map((p) => (p._id === id ? { ...p, ...data } : p)));
      setSuccess(`Proposal ${status === 'approved' ? 'approved' : 'rejected'} successfully`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Action failed');
    }
  };

  if (loading) return <p className="loading-text">Loading proposals…</p>;

  return (
    <div>
      <h2 className="page-title">Student Proposals</h2>

      {error   && <div className="alert-error">{error}</div>}
      {success && <div className="alert-success">{success}</div>}

      {proposals.length === 0 ? (
        <p className="empty-text">No proposals received yet.</p>
      ) : (
        <div className="proposals-list">
          {proposals.map((p) => (
            <div key={p._id} className="proposal-review-card">
              <div className="proposal-review-header">
                <div>
                  <h4>{p.title}</h4>
                  <p className="student-name">
                    {p.studentId?.name}
                    {p.studentId?.rollNo && ` — ${p.studentId.rollNo}`}
                    {p.studentId?.department && ` | ${p.studentId.department}`}
                  </p>
                </div>
                <span className="badge" style={{ background: STATUS_COLOR[p.status] }}>
                  {p.status.toUpperCase()}
                </span>
              </div>

              <p className="proposal-desc">{p.description}</p>

              {p.proposalFile && (
                <a href={`${process.env.REACT_APP_UPLOADS_URL || 'http://localhost:5000/uploads'}/${p.proposalFile}`}
                  target="_blank" rel="noreferrer" className="file-link">
                  View Proposal File
                </a>
              )}

              {p.status === 'pending' && (
                <div className="review-actions">
                  <textarea
                    rows={3}
                    placeholder="Write feedback (required for rejection)…"
                    value={feedbacks[p._id] || ''}
                    onChange={(e) => setFeedbacks((f) => ({ ...f, [p._id]: e.target.value }))}
                    style={{ resize: 'vertical', marginBottom: 10 }}
                  />
                  <div className="review-btns">
                    <button className="btn-approve" onClick={() => handleReview(p._id, 'approved')}>
                      ✓ Approve
                    </button>
                    <button className="btn-reject" onClick={() => handleReview(p._id, 'rejected')}>
                      ✗ Reject
                    </button>
                  </div>
                </div>
              )}

              {p.supervisorFeedback && p.status !== 'pending' && (
                <div className="feedback-box">
                  <strong>Your Feedback:</strong>
                  <p>{p.supervisorFeedback}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ReviewProposals;
