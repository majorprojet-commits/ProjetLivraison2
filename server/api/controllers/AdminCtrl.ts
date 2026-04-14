import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { SellerModel } from '../../db/models/Seller.js';
import { UserModel } from '../../db/models/User.js';
import { OrderModel } from '../../db/models/Order.js';
import { GlobalConfigModel } from '../../db/models/GlobalConfig.js';
import { ZoneModel } from '../../db/models/Zone.js';
import { DisputeModel } from '../../db/models/Dispute.js';

export class AdminCtrl {
  getGlobalStats = async (req: AuthRequest, res: Response) => {
    try {
      const totalRevenue = await OrderModel.aggregate([
        { $match: { status: 'delivered' } },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ]);

      const activeSellers = await SellerModel.countDocuments({ status: 'active' });
      const totalOrders = await OrderModel.countDocuments();
      
      const config = await GlobalConfigModel.findOne({ key: 'commission_rate' });
      const commissionRate = config ? config.value : 0.15;
      
      const commissionRevenue = (totalRevenue[0]?.total || 0) * commissionRate;

      res.json({
        totalRevenue: totalRevenue[0]?.total || 0,
        activeSellers,
        totalOrders,
        commissionRevenue,
        revenueHistory: [
          { date: 'Jan', amount: 85000 },
          { date: 'Feb', amount: 92000 },
          { date: 'Mar', amount: 125000 }
        ]
      });
    } catch (e) { res.status(500).json({ error: 'Server Error' }); }
  };

  updateSellerStatus = async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const rest = await SellerModel.findByIdAndUpdate(id, { status }, { new: true });
      if (!rest) return res.status(404).json({ error: 'Seller not found' });
      res.json(rest);
    } catch (e) { res.status(500).json({ error: 'Server Error' }); }
  };

  updateCommissionRate = async (req: AuthRequest, res: Response) => {
    try {
      const { rate } = req.body;
      await GlobalConfigModel.findOneAndUpdate(
        { key: 'commission_rate' },
        { value: rate / 100 },
        { upsert: true, new: true }
      );
      res.json({ success: true, rate });
    } catch (e) { res.status(500).json({ error: 'Server Error' }); }
  };

  banUser = async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { isBanned } = req.body;
      const user = await UserModel.findByIdAndUpdate(id, { isBanned }, { new: true });
      if (!user) return res.status(404).json({ error: 'User not found' });
      res.json(user);
    } catch (e) { res.status(500).json({ error: 'Server Error' }); }
  };

  getZones = async (req: AuthRequest, res: Response) => {
    try {
      const zones = await ZoneModel.find();
      res.json(zones);
    } catch (e) { res.status(500).json({ error: 'Server Error' }); }
  };

  createZone = async (req: AuthRequest, res: Response) => {
    try {
      const zone = await ZoneModel.create(req.body);
      res.status(201).json(zone);
    } catch (e) { res.status(500).json({ error: 'Server Error' }); }
  };

  updateZone = async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const zone = await ZoneModel.findByIdAndUpdate(id, req.body, { new: true });
      res.json(zone);
    } catch (e) { res.status(500).json({ error: 'Server Error' }); }
  };

  deleteZone = async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      await ZoneModel.findByIdAndDelete(id);
      res.json({ success: true });
    } catch (e) { res.status(500).json({ error: 'Server Error' }); }
  };

  getDisputes = async (req: AuthRequest, res: Response) => {
    try {
      const disputes = await DisputeModel.find()
        .populate('orderId')
        .populate('userId', 'name email')
        .populate('sellerId', 'name');
      res.json(disputes);
    } catch (e) { res.status(500).json({ error: 'Server Error' }); }
  };

  updateDisputeStatus = async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const dispute = await DisputeModel.findByIdAndUpdate(id, { status }, { new: true });
      res.json(dispute);
    } catch (e) { res.status(500).json({ error: 'Server Error' }); }
  };
}
