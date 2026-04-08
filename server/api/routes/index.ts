import { Router } from 'express';
import restaurantRoutes from './restaurant.js';
import orderRoutes from './order.js';
import userRoutes from './user.js';
import authRoutes from './auth.js';

const router = Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'API is running (Clean Architecture)' });
});

router.use('/auth', authRoutes);
router.use('/restaurants', restaurantRoutes);
router.use('/orders', orderRoutes);
router.use('/users', userRoutes);

export default router;
