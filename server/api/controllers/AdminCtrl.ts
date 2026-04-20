import { Response } from 'express';
import { format } from 'date-fns';
import { AuthRequest } from '../middleware/auth.ts';
import { SellerModel } from '../../db/models/Seller.ts';
import { UserModel } from '../../db/models/User.ts';
import { OrderModel } from '../../db/models/Order.ts';
import { GlobalConfigModel } from '../../db/models/GlobalConfig.ts';
import { ZoneModel } from '../../db/models/Zone.ts';
import { DisputeModel } from '../../db/models/Dispute.ts';
import { PromoCodeModel } from '../../db/models/PromoCode.ts';
import { AuditLogModel } from '../../db/models/AuditLog.ts';
import { UserVM } from '../viewmodels/UserVM.ts';
import { SellerVM } from '../viewmodels/SellerVM.ts';
import { User } from '../../core/entities/User.ts';
import { Seller } from '../../core/entities/Seller.ts';

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
      const d = await SellerModel.findByIdAndUpdate(id, { status }, { new: true });
      if (!d) return res.status(404).json({ error: 'Seller not found' });
      
      const seller = new Seller(
        d._id.toString(), d.name, d.rating, d.tags, d.image||'', 
        d.deliveryTime||'', d.deliveryFee||0, d.menu||[], 
        (d as any).type || 'restaurant', (d as any).status || 'active', (d as any).ownerId
      );
      res.json(SellerVM.format(seller));
    } catch (e) { res.status(500).json({ error: 'Server Error' }); }
  };

  deleteSeller = async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      await SellerModel.findByIdAndDelete(id);
      res.json({ success: true });
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
      const d = await UserModel.findByIdAndUpdate(id, { isBanned }, { new: true });
      if (!d) return res.status(404).json({ error: 'User not found' });
      
      const user = new User(d._id.toString(), d.name||'', d.email||'', d.phone||'', d.role||'', d.password, d.sellerId, d.isBanned);
      res.json(UserVM.format(user));
    } catch (e) { res.status(500).json({ error: 'Server Error' }); }
  };

  deleteUser = async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      await UserModel.findByIdAndDelete(id);
      res.json({ success: true });
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
      const { status, message } = req.body;
      const updateData: any = { status };
      if (message) {
        updateData.$push = { messages: { senderId: req.user!.id, text: message, createdAt: new Date() } };
      }
      const dispute = await DisputeModel.findByIdAndUpdate(id, updateData, { new: true });
      res.json(dispute);
    } catch (e) { res.status(500).json({ error: 'Server Error' }); }
  };

  // --- Promo Codes ---
  getPromoCodes = async (req: AuthRequest, res: Response) => {
    try {
      const codes = await PromoCodeModel.find().sort({ createdAt: -1 });
      res.json(codes);
    } catch (e) { res.status(500).json({ error: 'Server Error' }); }
  };

  createPromoCode = async (req: AuthRequest, res: Response) => {
    try {
      const code = await PromoCodeModel.create(req.body);
      await AuditLogModel.create({
        adminId: req.user!.id,
        action: 'create_promo',
        targetType: 'config',
        targetId: code.id,
        details: req.body
      });
      res.status(201).json(code);
    } catch (e) { res.status(500).json({ error: 'Server Error' }); }
  };

  // --- Drivers ---
  getDrivers = async (req: AuthRequest, res: Response) => {
    try {
      const drivers = await UserModel.find({ role: 'driver' });
      res.json(drivers.map(UserVM.format));
    } catch (e) { res.status(500).json({ error: 'Server Error' }); }
  };

  verifyDriver = async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const d = await UserModel.findOneAndUpdate(
        { _id: id, role: 'driver' },
        { 'driverInfo.verificationStatus': status },
        { new: true }
      );
      if (!d) return res.status(404).json({ error: 'Driver not found' });
      res.json(UserVM.format(new User(d._id.toString(), d.name||'', d.email||'', d.phone||'', d.role||'', d.password, d.sellerId, d.isBanned)));
    } catch (e) { res.status(500).json({ error: 'Server Error' }); }
  };

  // --- Audit Logs ---
  getAuditLogs = async (req: AuthRequest, res: Response) => {
    try {
      const logs = await AuditLogModel.find().sort({ createdAt: -1 }).limit(100);
      res.json(logs);
    } catch (e) { res.status(500).json({ error: 'Server Error' }); }
  };
}
