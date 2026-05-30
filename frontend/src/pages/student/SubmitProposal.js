import { useState, useEffect } from 'react';
import api from '../../services/api';
import './Student.css';

const STATUS_COLOR = { pending: '#f57c00', approved: '#388e3c', rejected: '#d32f2f' };

function SubmitProposal() {
  const [project,  setProject]  = useState(null);
  const [form,     setForm]     = useState({ title: '', description: '' });
  const [file,     setFile]     = useState(null);
  const [errors,   setErrors]   = useState({});
  const [apiError, setApiError] = useState('');
  const [success,  setSuccess]  = useState('');
  const [loading,  setLoading]  = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    api.get('/student/project')
      .then(({ data }) => { if (data) setProject(data); })
      .finally(() => setFetching(false));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: '' }));
    setApiError('');
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim())       e.title       = 'Project title is required';
    if (!form.description.trim()) e.description = 'Description is required';
    else if (form.description.trim().length < 30) e.description = 'Please provide a more detailed description (min 30 chars)';
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
      formData.append('title',       form.title.trim());
      formData.append('description', form.description.trim());
      if (file) formData.append('proposalFile', file);

      const { data } = await api.post('/student/proposal', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setProject(data);
      setSuccess('Proposal submitted successfully!');
    } catch (err) {
      setApiError(err.response?.data?.message || 'Submission failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <p className="loading-text">Loading…</p>;

  if (project) {
    return (
      <div>
        <h2 className="page-title">My Proposal</h2>
        <div className="proposal-card">
          <div className="proposal-header">
            <h3>{project.title}</h3>
            <span className="badge" style={{ background: STATUS_COLOR[project.status] }}>
              {project.status.toUpperCase()}
            </span>
          </div>
          <p className="proposal-description">{project.description}</p>

          {project.proposalFile && (
            <a href={`${process.env.REACT_APP_UPLOADS_URL || 'http://localhost:5000/uploads'}/${project.proposalFile}`}
              target="_blank" rel="noreferrer" className="file-link">
              View Uploaded File
            </a>
          )}

          {project.supervisorFeedback && (
            <div className="feedback-box">
              <strong>Supervisor Feedback:</strong>
              <p>{project.supervisorFeedback}</p>
            </div>
          )}

          {project.status === 'pending' && (
            <p className="info-text">Your proposal is under review. Please wait for supervisor feedback.</p>
          )}
          {project.status === 'approved' && (
            <p className="success-text">Approved! You can now submit weekly progress reports.</p>
          )}
          {project.status === 'rejected' && (
            <p className="error-text-inline">Your proposal was rejected. Review the feedback above and contact your supervisor.</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="page-title">Submit FYP Proposal</h2>

      {apiError && <div className="alert-error">{apiError}</div>}
      {success  && <div className="alert-success">{success}</div>}

      <div className="form-card">
        <form onSubmit={handleSubmit} noValidate>
          <div className={`form-group ${errors.title ? 'has-error' : ''}`}>
            <label>Project Title *</label>
            <input name="title" type="text" placeholder="Enter your FYP title"
              value={form.title} onChange={handleChange} />
            {errors.title && <span className="field-error">{errors.title}</span>}
          </div>

          <div className={`form-group ${errors.description ? 'has-error' : ''}`}>
            <label>Description *</label>
            <textarea name="description" rows={5} placeholder="Describe your project in detail…"
              value={form.description} onChange={handleChange} style={{ resize: 'vertical' }} />
            {errors.description && <span className="field-error">{errors.description}</span>}
          </div>

          <div className="form-group">
            <label>Proposal File <span className="muted">(optional, PDF/DOC)</span></label>
            <input type="file" accept=".pdf,.doc,.docx"
              onChange={(e) => setFile(e.target.files[0])} />
            {file && <span className="file-name">{file.name}</span>}
          </div>

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? 'Submitting…' : 'Submit Proposal'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default SubmitProposal;
