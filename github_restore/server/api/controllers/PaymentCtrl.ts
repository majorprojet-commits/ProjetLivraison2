import { Request, Response } from 'express';
import { InitializePayUnitPayment } from '../../usecases/InitializePayUnitPayment.js';
import { AuthRequest } from '../middleware/auth.js';

export class PaymentCtrl {
  constructor(private initializePayUnit: InitializePayUnitPayment) {}

  initialize = async (req: AuthRequest, res: Response) => {
    try {
      const { amount, currency, orderId, description } = req.body;
      
      if (!amount || !currency || !orderId) {
        return res.status(400).json({ error: 'Missing required payment parameters' });
      }

      const appUrl = process.env.APP_URL || 'http://localhost:3000';
      
      const result = await this.initializePayUnit.execute({
        amount,
        currency,
        transactionId: orderId,
        returnUrl: `${appUrl}/payment/success?orderId=${orderId}`,
        notifyUrl: `${appUrl}/api/payments/payunit/webhook`,
        description: description || `Payment for order #${orderId}`
      });

      res.json(result);
    } catch (e) {
      console.error('[PaymentCtrl] Initialize error:', e);
      res.status(500).json({ error: e instanceof Error ? e.message : 'Server Error' });
    }
  };

  webhook = async (req: Request, res: Response) => {
    try {
      console.log('[PayUnit] Webhook received:', req.body);
      // Here you would verify the signature and update the order status
      // For now, we just acknowledge the webhook
      res.status(200).send('OK');
    } catch (e) {
      console.error('[PaymentCtrl] Webhook error:', e);
      res.status(500).json({ error: 'Server Error' });
    }
  };
}
