const User = require('../models/User');
const Project = require('../models/Project');
const Progress = require('../models/Progress');

const getProfile = async (req, res) => {
  try {
    const supervisor = await User.findById(req.user._id).select('-password');
    res.json(supervisor);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getAssignedStudents = async (req, res) => {
  try {
    const students = await User.find({ role: 'student', supervisorId: req.user._id }).select(
      '-password'
    );
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getAllProposals = async (req, res) => {
  try {
    const proposals = await Project.find({ supervisorId: req.user._id })
      .populate('studentId', 'name rollNo department')
      .sort('-createdAt');
    res.json(proposals);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const reviewProposal = async (req, res) => {
  const { status, feedback } = req.body;

  if (!status || !['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ message: 'Status must be approved or rejected' });
  }

  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    if (project.supervisorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    project.status = status;
    project.supervisorFeedback = feedback || '';
    await project.save();

    res.json(project);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getStudentProgress = async (req, res) => {
  try {
    const progress = await Progress.find({ studentId: req.params.studentId })
      .populate('projectId', 'title')
      .sort('weekNumber');
    res.json(progress);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const giveFeedback = async (req, res) => {
  const { feedback } = req.body;

  if (!feedback) {
    return res.status(400).json({ message: 'Feedback is required' });
  }

  try {
    const progress = await Progress.findByIdAndUpdate(
      req.params.id,
      { feedback, status: 'reviewed', reviewedAt: new Date() },
      { new: true }
    );
    if (!progress) return res.status(404).json({ message: 'Progress entry not found' });
    res.json(progress);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getProfile,
  getAssignedStudents,
  getAllProposals,
  reviewProposal,
  getStudentProgress,
  giveFeedback,
};
