export class Order {
  constructor(
    public id: string,
    public userId: string,
    public restaurantId: string,
    public items: any[],
    public total: number,
    public status: string,
    public createdAt: Date,
    public driverId?: string,
    public pickupCode?: string,
    public clientCode?: string,
    public deliveryPhoto?: string,
    public prepTimeExtension?: number,
    public driverEta?: Date
  ) {}
}
