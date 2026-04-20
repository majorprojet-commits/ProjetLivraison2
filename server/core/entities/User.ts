export class User {
  constructor(
    public id: string,
    public name: string,
    public email: string,
    public phone: string,
    public role: string,
    public password?: string,
    public sellerId?: string,
    public isBanned: boolean = false,
    public driverInfo?: {
      verificationStatus: 'pending' | 'verified' | 'rejected';
      documents: string[];
      performanceScore: number;
      totalDeliveries: number;
      equipmentStatus: string;
    }
  ) {}
}
