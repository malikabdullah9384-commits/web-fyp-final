import { useState, useEffect } from 'react';
import api from '../../services/api';
import './Student.css';

function StudentProgress() {
  const [progressList, setProgressList] = useState([]);
  const [project,      setProject]      = useState(null);
  const [form,         setForm]         = useState({ weekNumber: '', description: '' });
  const [file,         setFile]         = useState(null);
  const [errors,       setErrors]       = useState({});
  const [apiError,     setApiError]     = useState('');
  const [success,      setSuccess]      = useState('');
  const [loading,      setLoading]      = useState(false);
  const [fetching,     setFetching]     = useState(true);

  const fetchProgress = () =>
    api.get('/student/progress').then(({ data }) => setProgressList(data));

  useEffect(() => {
    Promise.all([
      api.get('/student/project'),
      api.get('/student/progress'),
    ]).then(([proj, prog]) => {
      setProject(proj.data);
      setProgressList(prog.data);
    }).finally(() => setFetching(false));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: '' }));
    setApiError('');
  };

  const validate = () => {
    const e = {};
    if (!form.weekNumber)  e.weekNumber  = 'Week number is required';
    else if (isNaN(form.weekNumber) || +form.weekNumber < 1) e.weekNumber = 'Enter a valid week number';
    if (!form.description.trim()) e.description = 'Description is required';
    else if (form.description.trim().length < 20) e.description = 'Please describe your progress in more detail';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fieldErrors = validate();
    if (Object.keys(fieldErrors).length) { setErrors(fieldErrors); return; }

    setLoading(true);
    setApiError('');
    try {
      const formData = new FormData();
      formData.append('weekNumber',  form.weekNumber);
      formData.append('description', form.description.trim());
      if (file) formData.append('file', file);

      await api.post('/student/progress', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setForm({ weekNumber: '', description: '' });
      setFile(null);
      setSuccess('Progress report submitted!');
      fetchProgress();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setApiError(err.response?.data?.message || 'Submission failed.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <p className="loading-text">Loading…</p>;

  const canSubmit = project?.status === 'approved';

  return (
    <div>
      <h2 className="page-title">Weekly Progress</h2>

      {!canSubmit && (
        <div className="alert-info">
          You can submit progress reports only after your proposal is approved.
          {project?.status === 'pending' && ' Your proposal is currently under review.'}
          {!project && ' You have not submitted a proposal yet.'}
        </div>
      )}

      {canSubmit && (
        <>
          {apiError && <div className="alert-error">{apiError}</div>}
          {success  && <div className="alert-success">{success}</div>}

          <div className="form-card">
            <h3 className="form-card-title">Submit Weekly Report</h3>
            <form onSubmit={handleSubmit} noValidate>
              <div className={`form-group ${errors.weekNumber ? 'has-error' : ''}`}>
                <label>Week Number *</label>
                <input name="weekNumber" type="number" min="1" max="52"
                  placeholder="e.g. 1" value={form.weekNumber} onChange={handleChange}
                  style={{ maxWidth: 120 }} />
                {errors.weekNumber && <span className="field-error">{errors.weekNumber}</span>}
              </div>

              <div className={`form-group ${errors.description ? 'has-error' : ''}`}>
                <label>Progress Description *</label>
                <textarea name="description" rows={5}
                  placeholder="Describe what you accomplished this week…"
                  value={form.description} onChange={handleChange}
                  style={{ resize: 'vertical' }} />
                {errors.description && <span className="field-error">{errors.description}</span>}
              </div>

              <div className="form-group">
                <label>Supporting File <span className="muted">(optional)</span></label>
                <input type="file" onChange={(e) => setFile(e.target.files[0])} />
                {file && <span className="file-name">{file.name}</span>}
              </div>

              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? 'Submitting…' : 'Submit Report'}
              </button>
            </form>
          </div>
        </>
      )}

      <h3 className="section-label">Submitted Reports ({progressList.length})</h3>

      {progressList.length === 0 ? (
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
              {p.feedback && (
                <div className="feedback-box">
                  <strong>Supervisor Feedback:</strong>
                  <p>{p.feedback}</p>
                  {p.reviewedAt && (
                    <small>Reviewed on {new Date(p.reviewedAt).toLocaleDateString()}</small>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default StudentProgress;
