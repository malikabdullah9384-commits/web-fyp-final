const User           = require('../models/User');
const RolePermission = require('../models/RolePermission');
const AuditLog       = require('../models/AuditLog');
const Project        = require('../models/Project');
const { PERMISSIONS, ROLE_DEFAULTS } = require('../config/permissions');

const getDashboardStats = async (req, res, next) => {
  try {
    const [totalUsers, admins, supervisors, students, projects, auditCount] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'admin' }),
      User.countDocuments({ role: 'supervisor' }),
      User.countDocuments({ role: 'student' }),
      Project.countDocuments(),
      AuditLog.countDocuments(),
    ]);

    const recentLogs = await AuditLog.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('actor', 'name email role');

    res.json({ totalUsers, admins, supervisors, students, projects, auditCount, recentLogs });
  } catch (err) {
    next(err);
  }
};

const getAdmins = async (req, res, next) => {
  try {
    const admins = await User.find({ role: 'admin' }).select('-password').sort({ createdAt: -1 });
    res.json(admins);
  } catch (err) {
    next(err);
  }
};

const createAdmin = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) return res.status(409).json({ message: 'Email already in use' });

    const admin = await User.create({ name: name.trim(), email, password, role: 'admin' });

    await AuditLog.create({
      actor:      req.user._id,
      actorEmail: req.user.email,
      actorRole:  req.user.role,
      action:     'CREATE_ADMIN',
      target:     'User',
      targetId:   admin._id.toString(),
      details:    { email: admin.email },
      ip:         req.ip,
    });

    res.status(201).json(admin.toSafeObject());
  } catch (err) {
    next(err);
  }
};

const updateAdmin = async (req, res, next) => {
  try {
    const { name, email, isActive } = req.body;
    const admin = await User.findOne({ _id: req.params.id, role: 'admin' });
    if (!admin) return res.status(404).json({ message: 'Admin not found' });

    if (name)    admin.name    = name.trim();
    if (email)   admin.email   = email.toLowerCase().trim();
    if (isActive !== undefined) admin.isActive = isActive;

    await admin.save();

    await AuditLog.create({
      actor:      req.user._id,
      actorEmail: req.user.email,
      actorRole:  req.user.role,
      action:     'UPDATE_ADMIN',
      target:     'User',
      targetId:   admin._id.toString(),
      details:    { name, email, isActive },
      ip:         req.ip,
    });

    res.json(admin.toSafeObject());
  } catch (err) {
    next(err);
  }
};

const deleteAdmin = async (req, res, next) => {
  try {
    const admin = await User.findOne({ _id: req.params.id, role: 'admin' });
    if (!admin) return res.status(404).json({ message: 'Admin not found' });

    await User.deleteOne({ _id: admin._id });

    await AuditLog.create({
      actor:      req.user._id,
      actorEmail: req.user.email,
      actorRole:  req.user.role,
      action:     'DELETE_ADMIN',
      target:     'User',
      targetId:   admin._id.toString(),
      details:    { email: admin.email },
      ip:         req.ip,
    });

    res.json({ message: 'Admin deleted' });
  } catch (err) {
    next(err);
  }
};

const getRolePermissions = async (req, res, next) => {
  try {
    const roles = ['admin', 'supervisor', 'student'];
    const result = {};

    for (const role of roles) {
      const perms = await RolePermission.getPermissions(role);
      result[role] = perms;
    }

    res.json({ rolePermissions: result, allPermissions: Object.values(PERMISSIONS) });
  } catch (err) {
    next(err);
  }
};

const updateRolePermissions = async (req, res, next) => {
  try {
    const { role }        = req.params;
    const { permissions } = req.body;

    const validRoles = ['admin', 'supervisor', 'student'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    if (!Array.isArray(permissions)) {
      return res.status(400).json({ message: 'Permissions must be an array' });
    }

    const allPerms = Object.values(PERMISSIONS);
    const invalid  = permissions.filter((p) => !allPerms.includes(p));
    if (invalid.length) {
      return res.status(400).json({ message: `Unknown permissions: ${invalid.join(', ')}` });
    }

    await RolePermission.findOneAndUpdate(
      { role },
      { permissions },
      { upsert: true, new: true }
    );

    await AuditLog.create({
      actor:      req.user._id,
      actorEmail: req.user.email,
      actorRole:  req.user.role,
      action:     'UPDATE_ROLE_PERMISSIONS',
      target:     'RolePermission',
      targetId:   role,
      details:    { permissions },
      ip:         req.ip,
    });

    res.json({ message: `Permissions updated for ${role}`, permissions });
  } catch (err) {
    next(err);
  }
};

const resetRolePermissions = async (req, res, next) => {
  try {
    const { role } = req.params;
    const defaults = ROLE_DEFAULTS[role];
    if (!defaults) return res.status(400).json({ message: 'Invalid role' });

    await RolePermission.findOneAndUpdate(
      { role },
      { permissions: defaults },
      { upsert: true, new: true }
    );

    res.json({ message: `Permissions reset to defaults for ${role}`, permissions: defaults });
  } catch (err) {
    next(err);
  }
};

const getUserPermissions = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const rolePerms = await RolePermission.getPermissions(user.role);

    res.json({
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      rolePermissions:    rolePerms,
      extraPermissions:   user.extraPermissions,
      deniedPermissions:  user.deniedPermissions,
      effectivePermissions: [
        ...rolePerms.filter((p) => !user.deniedPermissions.includes(p)),
        ...user.extraPermissions.filter((p) => !rolePerms.includes(p)),
      ],
    });
  } catch (err) {
    next(err);
  }
};

const updateUserPermissions = async (req, res, next) => {
  try {
    const { extraPermissions, deniedPermissions } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.role === 'superadmin') {
      return res.status(400).json({ message: 'Cannot modify superadmin permissions' });
    }

    const allPerms = Object.values(PERMISSIONS);

    if (extraPermissions !== undefined) {
      const invalid = extraPermissions.filter((p) => !allPerms.includes(p));
      if (invalid.length) return res.status(400).json({ message: `Unknown: ${invalid.join(', ')}` });
      user.extraPermissions = extraPermissions;
    }

    if (deniedPermissions !== undefined) {
      const invalid = deniedPermissions.filter((p) => !allPerms.includes(p));
      if (invalid.length) return res.status(400).json({ message: `Unknown: ${invalid.join(', ')}` });
      user.deniedPermissions = deniedPermissions;
    }

    await user.save();

    await AuditLog.create({
      actor:      req.user._id,
      actorEmail: req.user.email,
      actorRole:  req.user.role,
      action:     'UPDATE_USER_PERMISSIONS',
      target:     'User',
      targetId:   user._id.toString(),
      details:    { extraPermissions, deniedPermissions },
      ip:         req.ip,
    });

    res.json({ message: 'User permissions updated', extraPermissions: user.extraPermissions, deniedPermissions: user.deniedPermissions });
  } catch (err) {
    next(err);
  }
};

const getAuditLogs = async (req, res, next) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const skip  = (page - 1) * limit;

    const filter = {};
    if (req.query.action) filter.action     = req.query.action;
    if (req.query.role)   filter.actorRole  = req.query.role;

    const [logs, total] = await Promise.all([
      AuditLog.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('actor', 'name email role'),
      AuditLog.countDocuments(filter),
    ]);

    res.json({ logs, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    const { role, search } = req.query;
    const filter = {};
    if (role)   filter.role = role;
    if (search) filter.$or  = [
      { name:  { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDashboardStats,
  getAdmins,
  createAdmin,
  updateAdmin,
  deleteAdmin,
  getRolePermissions,
  updateRolePermissions,
  resetRolePermissions,
  getUserPermissions,
  updateUserPermissions,
  getAuditLogs,
  getAllUsers,
};
