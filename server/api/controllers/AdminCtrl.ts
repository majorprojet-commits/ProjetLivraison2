import { Response } from 'express';
import { format } from 'date-fns';
import { AuthRequest } from '../middleware/auth.ts';
import { SellerModel } from '../../db/models/Seller.ts';
import { UserModel } from '../../db/models/User.ts';
import { OrderModel } from '../../db/models/Order.ts';
import { GlobalConfigModel } from '../../db/models/GlobalConfig.ts';
import { ZoneModel } from '../../db/models/Zone.ts';
import { DisputeModel } from '../../db/models/Dispute.ts';

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

      const revenueHistory = await OrderModel.aggregate([
        { $match: { status: 'delivered' } },
        { 
          $group: { 
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } }, 
            amount: { $sum: "$total" } 
          } 
        },
        { $sort: { "_id": 1 } },
        { $limit: 7 }
      ]);

      const formattedHistory = revenueHistory.map(h => ({
        date: format(new Date(h._id), 'ccc'),
        amount: h.amount
      }));

      // Fallback if no history
      const history = formattedHistory.length > 0 ? formattedHistory : [
        { date: 'Lun', amount: 0 },
        { date: 'Mar', amount: 0 },
        { date: 'Mer', amount: 0 },
        { date: 'Jeu', amount: 0 },
        { date: 'Ven', amount: 0 },
        { date: 'Sam', amount: 0 },
        { date: 'Dim', amount: 0 }
      ];

      res.json({
        totalRevenue: totalRevenue[0]?.total || 0,
        activeSellers,
        totalOrders,
        commissionRevenue,
        revenueHistory: history
      });
    } catch (e) { 
      console.error(e);
      res.status(500).json({ error: 'Server Error' }); 
    }
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
