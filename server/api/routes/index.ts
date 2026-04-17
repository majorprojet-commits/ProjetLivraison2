import { Router } from 'express';
import sellerRoutes from './seller.ts';
import orderRoutes from './order.ts';
import userRoutes from './user.ts';
import authRoutes from './auth.ts';
import adminRoutes from './admin.ts';
import paymentRoutes from './payment.ts';

const router = Router();

router.use((req, res, next) => {
  console.log(`[API] ${req.method} ${req.url}`);
  next();
});

router.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'API is running (Clean Architecture)' });
});

router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/sellers', sellerRoutes);
router.use('/orders', orderRoutes);
router.use('/users', userRoutes);
router.use('/payments', paymentRoutes);

// 404 handler for API
router.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.url} not found` });
});

export default router;
