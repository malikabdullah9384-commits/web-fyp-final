const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  actor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  actorEmail: { type: String },
  actorRole:  { type: String },
  action:     { type: String, required: true },
  target:     { type: String },
  targetId:   { type: String },
  details:    { type: mongoose.Schema.Types.Mixed },
  ip:         { type: String },
  userAgent:  { type: String },
}, { timestamps: true });

auditLogSchema.index({ actor: 1 });
auditLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
