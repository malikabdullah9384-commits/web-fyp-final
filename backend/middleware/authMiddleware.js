const { verifyToken }  = require('../utils/jwt');
const User             = require('../models/User');
const RolePermission   = require('../models/RolePermission');

const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = verifyToken(token);
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) return res.status(401).json({ message: 'User not found' });
    if (!req.user.isActive) return res.status(403).json({ message: 'Account is deactivated' });
    next();
  } catch {
    res.status(401).json({ message: 'Token is not valid or has expired' });
  }
};

const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: `Access restricted to: ${roles.join(', ')}` });
  }
  next();
};

const hasPermission = (permission) => async (req, res, next) => {
  try {
    if (req.user.role === 'superadmin') return next();

    if (req.user.deniedPermissions?.includes(permission)) {
      return res.status(403).json({ message: 'Permission denied' });
    }

    if (req.user.extraPermissions?.includes(permission)) return next();

    const rolePerms = await RolePermission.getPermissions(req.user.role);
    if (rolePerms.includes(permission)) return next();

    res.status(403).json({ message: 'Insufficient permissions' });
  } catch (err) {
    next(err);
  }
};

const adminOnly      = requireRole('admin', 'superadmin');
const supervisorOnly = requireRole('supervisor');
const studentOnly    = requireRole('student');
const superAdminOnly = requireRole('superadmin');

module.exports = {
  protect,
  requireRole,
  hasPermission,
  adminOnly,
  supervisorOnly,
  studentOnly,
  superAdminOnly,
};
