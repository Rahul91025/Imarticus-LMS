const router = require('express').Router();
const { register, login, verifyOtp, getProfile } = require('../controllers/authController');
const auth = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/verify-otp', verifyOtp);
router.get('/profile', auth, getProfile);

module.exports = router;
