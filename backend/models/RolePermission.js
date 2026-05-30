const mongoose = require('mongoose');
const { ROLE_DEFAULTS } = require('../config/permissions');

const rolePermissionSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['superadmin', 'admin', 'supervisor', 'student'],
    required: true,
    unique: true,
  },
  permissions: {
    type: [String],
    default: [],
  },
}, { timestamps: true });

rolePermissionSchema.statics.getPermissions = async function (role) {
  let doc = await this.findOne({ role });
  if (!doc) {
    doc = await this.create({ role, permissions: ROLE_DEFAULTS[role] || [] });
  }
  return doc.permissions;
};

module.exports = mongoose.model('RolePermission', rolePermissionSchema);
