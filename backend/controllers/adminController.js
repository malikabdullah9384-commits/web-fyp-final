const User    = require('../models/User');
const Project = require('../models/Project');

const getDashboardStats = async (req, res, next) => {
  try {
    const [totalStudents, totalSupervisors, totalProjects, pendingProjects] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'supervisor' }),
      Project.countDocuments(),
      Project.countDocuments({ status: 'pending' }),
    ]);
    res.json({ totalStudents, totalSupervisors, totalProjects, pendingProjects });
  } catch (err) {
    next(err);
  }
};

const getSupervisors = async (req, res, next) => {
  try {
    const supervisors = await User.find({ role: 'supervisor' })
      .select('-password')
      .sort('-createdAt');
    res.json(supervisors);
  } catch (err) {
    next(err);
  }
};

const addSupervisor = async (req, res, next) => {
  try {
    const { name, email, password, designation, field, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const exists = await User.findOne({ email: email.toLowerCase().trim() });
    if (exists) return res.status(409).json({ message: 'Email already in use' });

    const supervisor = await User.create({
      name: name.trim(),
      email,
      password,
      role: 'supervisor',
      designation: designation || '',
      field:       field       || '',
      phone:       phone       || '',
    });

    res.status(201).json(supervisor.toSafeObject());
  } catch (err) {
    next(err);
  }
};

const toggleSupervisor = async (req, res, next) => {
  try {
    const supervisor = await User.findOne({ _id: req.params.id, role: 'supervisor' });
    if (!supervisor) return res.status(404).json({ message: 'Supervisor not found' });

    supervisor.isActive = !supervisor.isActive;
    await supervisor.save();

    res.json({ isActive: supervisor.isActive });
  } catch (err) {
    next(err);
  }
};

const deleteSupervisor = async (req, res, next) => {
  try {
    const supervisor = await User.findOne({ _id: req.params.id, role: 'supervisor' });
    if (!supervisor) return res.status(404).json({ message: 'Supervisor not found' });

    await User.deleteOne({ _id: supervisor._id });
    res.json({ message: 'Supervisor deleted' });
  } catch (err) {
    next(err);
  }
};

const getStudents = async (req, res, next) => {
  try {
    const students = await User.find({ role: 'student' })
      .select('-password')
      .populate('supervisorId', 'name designation')
      .sort('-createdAt');
    res.json(students);
  } catch (err) {
    next(err);
  }
};

const addStudent = async (req, res, next) => {
  try {
    const { name, email, password, rollNo, department, batch, semester } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const exists = await User.findOne({ email: email.toLowerCase().trim() });
    if (exists) return res.status(409).json({ message: 'Email already in use' });

    const student = await User.create({
      name: name.trim(),
      email,
      password,
      role:       'student',
      rollNo:     rollNo     || '',
      department: department || '',
      batch:      batch      || '',
      semester:   semester   || '',
    });

    res.status(201).json(student.toSafeObject());
  } catch (err) {
    next(err);
  }
};

const deleteStudent = async (req, res, next) => {
  try {
    const student = await User.findOne({ _id: req.params.id, role: 'student' });
    if (!student) return res.status(404).json({ message: 'Student not found' });

    await User.deleteOne({ _id: student._id });
    res.json({ message: 'Student deleted' });
  } catch (err) {
    next(err);
  }
};

const assignSupervisor = async (req, res, next) => {
  try {
    const { studentId, supervisorId } = req.body;

    if (!studentId || !supervisorId) {
      return res.status(400).json({ message: 'studentId and supervisorId are required' });
    }

    const student = await User.findOneAndUpdate(
      { _id: studentId, role: 'student' },
      { supervisorId },
      { new: true }
    ).select('-password').populate('supervisorId', 'name designation');

    if (!student) return res.status(404).json({ message: 'Student not found' });

    res.json(student);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDashboardStats,
  getSupervisors,
  addSupervisor,
  toggleSupervisor,
  deleteSupervisor,
  getStudents,
  addStudent,
  deleteStudent,
  assignSupervisor,
};
