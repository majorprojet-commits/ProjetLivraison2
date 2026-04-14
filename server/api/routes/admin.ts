import { Router } from 'express';
import { AdminCtrl } from '../controllers/AdminCtrl.js';
import { authMiddleware, roleMiddleware } from '../middleware/auth.js';

const router = Router();
const ctrl = new AdminCtrl();

// All routes here require Super Admin role
router.use(authMiddleware, roleMiddleware(['admin']));

router.get('/stats', ctrl.getGlobalStats);
router.put('/sellers/:id/status', ctrl.updateSellerStatus);
router.put('/config/commissions', ctrl.updateCommissionRate);
router.put('/users/:id/ban', ctrl.banUser);

// Zones
router.get('/zones', ctrl.getZones);
router.post('/zones', ctrl.createZone);
router.put('/zones/:id', ctrl.updateZone);
router.delete('/zones/:id', ctrl.deleteZone);

// Disputes
router.get('/disputes', ctrl.getDisputes);
router.put('/disputes/:id/status', ctrl.updateDisputeStatus);

export default router;
