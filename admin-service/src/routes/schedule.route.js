import express from 'express';
import { createSchedule, cancelSchedule, getAllSchedules } from '../controllers/schedule.controller';
import { getUserContext } from '../middlewares/getUserContext.middleware';

const router = express.Router();

router.post("/schedule", getUserContext, createSchedule);
router.put('/schedule/:scheduleId', getUserContext, cancelSchedule);
router.get('/schedule', getUserContext, getAllSchedules);
export default router;