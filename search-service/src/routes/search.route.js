import { Router } from 'express';
import {searchTrains,autocomplete,debugStations,debugTrains} from '../controllers/search.controller.js';
const router = Router();

// GET /search/trains?from=Delhi&to=Mumbai&date=2025-07-15
router.get('/trains', searchTrains);

// GET /search/autocomplete?q=del
router.get('/autocomplete', autocomplete);

// Debug endpoints
router.get('/debug/stations', debugStations);
router.get('/debug/trains', debugTrains);

export default router;