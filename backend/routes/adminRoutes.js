const router = require('express').Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const {
  getDashboardStats,
  getSupervisors,
  addSupervisor,
  toggleSupervisor,
  deleteSupervisor,
  getStudents,
  addStudent,
  deleteStudent,
  assignSupervisor,
} = require('../controllers/adminController');

router.use(protect, adminOnly);

router.get('/stats', getDashboardStats);

router.get('/supervisors', getSupervisors);
router.post('/supervisors', addSupervisor);
router.put('/supervisors/:id/toggle', toggleSupervisor);
router.delete('/supervisors/:id', deleteSupervisor);

router.get('/students', getStudents);
router.post('/students', addStudent);
router.delete('/students/:id', deleteStudent);

router.post('/assign', assignSupervisor);

module.exports = router;
