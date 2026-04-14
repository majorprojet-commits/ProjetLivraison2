export interface Seller {
  id: string;
  name: string;
  rating: number;
  time: string;
  fee: string;
  image: string;
  type?: 'restaurant' | 'clothing' | 'supermarket' | 'other';
}

export interface Category {
  id: number;
  name: string;
  icon: string;
}

export interface Order {
  id: string;
  items: string;
  status: string;
  time: string;
  highlight?: boolean;
}

export interface DriverOffer {
  restaurant: string;
  distance: string;
  payout: string;
  address: string;
}

export interface HistoryItem {
  restaurant: string;
  time: string;
  amount: string;
}
