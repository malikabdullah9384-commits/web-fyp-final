const router = require('express').Router();
const { protect, studentOnly }      = require('../middleware/authMiddleware');
const { upload, handleUploadError } = require('../middleware/upload');
const { uploadLimiter }             = require('../middleware/rateLimiter');
const {
  getProfile,
  submitProposal,
  getMyProject,
  submitProgress,
  getMyProgress,
} = require('../controllers/studentController');

router.use(protect, studentOnly);

router.get('/profile',  getProfile);
router.get('/project',  getMyProject);
router.get('/progress', getMyProgress);

router.post('/proposal',
  uploadLimiter,
  upload.single('proposalFile'),
  handleUploadError,
  submitProposal
);

router.post('/progress',
  uploadLimiter,
  upload.single('file'),
  handleUploadError,
  submitProgress
);

module.exports = router;
