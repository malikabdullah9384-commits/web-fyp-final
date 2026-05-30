const { generateAccessToken } = require('../utils/jwt');
const User     = require('../models/User');
const AuditLog = require('../models/AuditLog');

const issueToken = (user) => generateAccessToken(user);

const safeUser = (user) => ({
  id:    user._id,
  name:  user.name,
  email: user.email,
  role:  user.role,
  extraPermissions:  user.extraPermissions  || [],
  deniedPermissions: user.deniedPermissions || [],
});

const register = async (req, res, next) => {
  try {
    const { name, email, password, rollNo, department, batch, semester } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({ message: 'Email is already registered' });
    }

    const user = await User.create({
      name:       name.trim(),
      email:      email.toLowerCase().trim(),
      password,
      role:       'student',
      rollNo:     rollNo || '',
      department: department || '',
      batch:      batch || '',
      semester:   semester || '',
    });

    await AuditLog.create({
      actor:      user._id,
      actorEmail: user.email,
      actorRole:  user.role,
      action:     'REGISTER',
      target:     'User',
      targetId:   user._id.toString(),
      ip:         req.ip,
      userAgent:  req.headers['user-agent'],
    });

    const token = issueToken(user);
    res.status(201).json({ token, user: safeUser(user) });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    if (!user.isActive) {
      return res.status(403).json({ message: 'Your account has been deactivated' });
    }

    const matched = await user.matchPassword(password);
    if (!matched) return res.status(401).json({ message: 'Invalid credentials' });

    user.lastLogin = new Date();
    await user.save();

    await AuditLog.create({
      actor:      user._id,
      actorEmail: user.email,
      actorRole:  user.role,
      action:     'LOGIN',
      target:     'User',
      targetId:   user._id.toString(),
      ip:         req.ip,
      userAgent:  req.headers['user-agent'],
    });

    const token = issueToken(user);
    res.json({ token, user: safeUser(user) });
  } catch (err) {
    next(err);
  }
};

const logout = async (req, res, next) => {
  try {
    await AuditLog.create({
      actor:      req.user._id,
      actorEmail: req.user.email,
      actorRole:  req.user.role,
      action:     'LOGOUT',
      target:     'User',
      targetId:   req.user._id.toString(),
      ip:         req.ip,
      userAgent:  req.headers['user-agent'],
    });
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('supervisorId', 'name email designation field');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, logout, getMe };
