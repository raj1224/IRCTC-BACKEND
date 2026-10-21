import express from 'express';
import {getUserContext} from '../middlewares/getUserContext.middleware.js';
import { internalAuth } from '../middlewares/internalAuth.middleware.js';
import { getProfile, updateProfile, deleteProfile, getUserInternal } from '../controllers/user.controller.js';

const router = express.Router();

router.get("/profile", getUserContext, getProfile);
router.put("/profile", getUserContext, updateProfile);
router.delete("/profile", getUserContext, deleteProfile);

router.get("/internal/:userId", internalAuth, getUserInternal);

export default router;