import { Router } from 'express';
import restaurantRoutes from './restaurant.js';
import orderRoutes from './order.js';
import userRoutes from './user.js';
import authRoutes from './auth.js';
import adminRoutes from './admin.js';

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
router.use('/restaurants', restaurantRoutes);
router.use('/orders', orderRoutes);
router.use('/users', userRoutes);

// 404 handler for API
router.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.url} not found` });
});

export default router;
