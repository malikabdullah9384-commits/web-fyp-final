const mongoose  = require('mongoose');
const { hashPassword, verifyPassword } = require('../utils/password');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [60, 'Name too long'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Invalid email format'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false,
  },
  role: {
    type: String,
    enum: ['superadmin', 'admin', 'supervisor', 'student'],
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  lastLogin: {
    type: Date,
  },
  extraPermissions: {
    type: [String],
    default: [],
  },
  deniedPermissions: {
    type: [String],
    default: [],
  },

  // Student-specific
  rollNo:      { type: String, default: '' },
  department:  { type: String, default: '' },
  batch:       { type: String, default: '' },
  semester:    { type: String, default: '' },
  supervisorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },

  // Supervisor-specific
  designation: { type: String, default: '' },
  field:       { type: String, default: '' },
  phone:       { type: String, default: '' },
  maxStudents: { type: Number, default: 5 },
}, { timestamps: true });

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await hashPassword(this.password);
});

userSchema.methods.matchPassword = async function (plain) {
  return verifyPassword(plain, this.password);
};

userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
