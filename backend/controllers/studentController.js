const User     = require('../models/User');
const Project  = require('../models/Project');
const Progress = require('../models/Progress');

const getProfile = async (req, res) => {
  try {
    const student = await User.findById(req.user._id)
      .select('-password')
      .populate('supervisorId', 'name designation field email phone');
    res.json(student);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const submitProposal = async (req, res) => {
  const { title, description } = req.body;

  if (!title || !description) {
    return res.status(400).json({ message: 'Title and description are required' });
  }

  try {
    const student = await User.findById(req.user._id);
    if (!student.supervisorId) {
      return res.status(400).json({ message: 'No supervisor assigned. Contact admin.' });
    }

    const existing = await Project.findOne({ studentId: req.user._id });
    if (existing) {
      return res.status(400).json({ message: 'You have already submitted a proposal' });
    }

    const project = await Project.create({
      title,
      description,
      studentId: req.user._id,
      supervisorId: student.supervisorId,
      proposalFile: req.file ? req.file.filename : null,
    });

    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getMyProject = async (req, res) => {
  try {
    const project = await Project.findOne({ studentId: req.user._id }).populate(
      'supervisorId',
      'name designation'
    );
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const submitProgress = async (req, res) => {
  const { weekNumber, description } = req.body;

  if (!weekNumber || !description) {
    return res.status(400).json({ message: 'Week number and description are required' });
  }

  try {
    const project = await Project.findOne({ studentId: req.user._id, status: 'approved' });
    if (!project) {
      return res.status(400).json({ message: 'No approved project found' });
    }

    const progress = await Progress.create({
      projectId: project._id,
      studentId: req.user._id,
      weekNumber,
      description,
      file: req.file ? req.file.filename : null,
    });

    res.status(201).json(progress);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getMyProgress = async (req, res) => {
  try {
    const progress = await Progress.find({ studentId: req.user._id }).sort('weekNumber');
    res.json(progress);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getProfile, submitProposal, getMyProject, submitProgress, getMyProgress };
