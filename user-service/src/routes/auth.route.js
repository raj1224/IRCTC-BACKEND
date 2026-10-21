import express from 'express';
const router = express.Router();
import {sendOTP, verifyOTP, login, rotateRefreshToken, verifyGoogleIdToken} from '../controllers/auth.controller.js';

router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOTP);
router.post("/login", login);
router.post("/refresh", rotateRefreshToken);
router.post("/google-auth", verifyGoogleIdToken);
export default router;