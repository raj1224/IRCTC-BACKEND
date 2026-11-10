import { Router } from 'express';
import ctrl from '../controllers/search.controller';
const router = Router();

// GET /search/trains?from=Delhi&to=Mumbai&date=2025-07-15
router.get('/trains', ctrl.searchTrains);

// GET /search/autocomplete?q=del
router.get('/autocomplete', ctrl.autocomplete);

// Debug endpoints
router.get('/debug/stations', ctrl.debugStations);
router.get('/debug/trains', ctrl.debugTrains);

export default router;