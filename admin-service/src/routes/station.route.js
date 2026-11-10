import express from 'express';
import { createStation, updateStation, deleteStation, getAllStations, getStationById, getStationByIdInternal } from '../controllers/station.controller';

import {getUserContext} from '../middlewares/getUserContext.middleware';
import { internalAuth } from '../middlewares/internalAuth.middleware';

const router = express.Router();

router.get("/station/internal/:stationId", internalAuth, getStationByIdInternal);

router.get("/station", getUserContext, getAllStations);
router.get("/station/:stationId", getUserContext, getStationById);
router.post("/station", getUserContext, createStation);

export default router;