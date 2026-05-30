const router   = require('express').Router();
const { register, login, logout, getMe } = require('../controllers/authController');
const { protect }                        = require('../middleware/authMiddleware');
const { authLimiter }                    = require('../middleware/rateLimiter');
const { validateLogin, validateRegister } = require('../middleware/validate');

router.post('/register', authLimiter, validateRegister, register);
router.post('/login',    authLimiter, validateLogin,    login);
router.post('/logout',   protect, logout);
router.get('/me',        protect, getMe);

module.exports = router;
