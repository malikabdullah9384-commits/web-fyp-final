const router = require('express').Router();
const { protect, superAdminOnly } = require('../middleware/authMiddleware');
const {
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
} = require('../controllers/superAdminController');

router.use(protect, superAdminOnly);

router.get('/dashboard',    getDashboardStats);
router.get('/users',        getAllUsers);

router.get('/admins',       getAdmins);
router.post('/admins',      createAdmin);
router.put('/admins/:id',   updateAdmin);
router.delete('/admins/:id', deleteAdmin);

router.get('/permissions',                     getRolePermissions);
router.put('/permissions/roles/:role',         updateRolePermissions);
router.post('/permissions/roles/:role/reset',  resetRolePermissions);
router.get('/permissions/users/:id',           getUserPermissions);
router.put('/permissions/users/:id',           updateUserPermissions);

router.get('/audit-logs', getAuditLogs);

module.exports = router;
