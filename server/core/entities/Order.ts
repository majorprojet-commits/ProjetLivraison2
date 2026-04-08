export class Order {
  constructor(
    public id: string,
    public userId: string,
    public restaurantId: string,
    public items: any[],
    public total: number,
    public status: string,
    public createdAt: Date,
    public driverId?: string
  ) {}
}
