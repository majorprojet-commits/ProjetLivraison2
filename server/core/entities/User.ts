export class User {
  constructor(
    public id: string,
    public name: string,
    public email: string,
    public phone: string,
    public role: string,
    public password?: string,
    public restaurantId?: string
  ) {}
}
