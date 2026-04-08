export class Restaurant {
  constructor(
    public id: string,
    public name: string,
    public rating: number,
    public tags: string[],
    public image: string,
    public deliveryTime: string,
    public deliveryFee: number,
    public menu: any[]
  ) {}
}
