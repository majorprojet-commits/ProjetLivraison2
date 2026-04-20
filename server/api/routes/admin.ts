import { Router } from 'express';
import { AdminCtrl } from '../controllers/AdminCtrl.ts';
import { authMiddleware, roleMiddleware } from '../middleware/auth.ts';

const router = Router();
const ctrl = new AdminCtrl();

// All routes here require Super Admin role
router.use(authMiddleware, roleMiddleware(['admin']));

router.get('/stats', ctrl.getGlobalStats);
router.put('/sellers/:id/status', ctrl.updateSellerStatus);
router.delete('/sellers/:id', ctrl.deleteSeller);
router.put('/config/commissions', ctrl.updateCommissionRate);
router.put('/users/:id/ban', ctrl.banUser);
router.delete('/users/:id', ctrl.deleteUser);

// Zones
router.get('/zones', ctrl.getZones);
router.post('/zones', ctrl.createZone);
router.put('/zones/:id', ctrl.updateZone);
router.delete('/zones/:id', ctrl.deleteZone);

// Disputes
router.get('/disputes', ctrl.getDisputes);
router.put('/disputes/:id/status', ctrl.updateDisputeStatus);

// Drivers
router.get('/drivers', ctrl.getDrivers);
router.put('/drivers/:id/verify', ctrl.verifyDriver);

// Promo Codes
router.get('/promos', ctrl.getPromoCodes);
router.post('/promos', ctrl.createPromoCode);

// Audit
router.get('/audit', ctrl.getAuditLogs);

export default router;
