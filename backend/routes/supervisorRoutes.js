const router = require('express').Router();
const { protect, supervisorOnly } = require('../middleware/authMiddleware');
const {
  getProfile,
  getAssignedStudents,
  getAllProposals,
  reviewProposal,
  getStudentProgress,
  giveFeedback,
} = require('../controllers/supervisorController');

router.use(protect, supervisorOnly);

router.get('/profile', getProfile);
router.get('/students', getAssignedStudents);
router.get('/proposals', getAllProposals);
router.put('/proposals/:id/review', reviewProposal);
router.get('/progress/:studentId', getStudentProgress);
router.put('/progress/:id/feedback', giveFeedback);

module.exports = router;
