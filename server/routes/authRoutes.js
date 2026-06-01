const express = require('express');

const router = express.Router();

const {
    register,
    login,
    getMe,
    verifyOTP,
    resendOTP
} = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);
router.post("/verify-otp", verifyOTP);
router.post("/resend-otp", resendOTP);

module.exports = router;