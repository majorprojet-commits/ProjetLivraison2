export class Seller {
  constructor(
    public id: string,
    public name: string,
    public rating: number,
    public tags: string[],
    public image: string,
    public deliveryTime: string,
    public deliveryFee: number,
    public menu: any[],
    public type: 'restaurant' | 'clothing' | 'supermarket' | 'other' = 'restaurant',
    public status: 'active' | 'suspended' | 'pending' = 'active',
    public ownerId?: string,
    public isPaused: boolean = false,
    public openingHours?: Record<string, string[]>,
    public payouts: any[] = [],
    public balance: number = 0
  ) {}
}
