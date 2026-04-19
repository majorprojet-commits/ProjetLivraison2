import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Order {
  id: string;
  status: string;
  items: any[];
  total: number;
  createdAt: string;
  sellerId: string;
  driverId?: string;
  driverEta?: number;
  pickupCode?: string;
  clientCode?: string;
  prepTimeExtension?: number;
}

interface SellerState {
  orders: Order[];
  menu: any[];
  settings: {
    isRushMode: boolean;
    openingHours: any;
  };
  analytics: {
    dailyRevenue: number;
    weeklyRevenue: number;
    topDishes: any[];
    cancellationRate: number;
  };
  reviews: any[];
}

const initialState: SellerState = {
  orders: [],
  menu: [],
  settings: {
    isRushMode: false,
    openingHours: {},
  },
  analytics: {
    dailyRevenue: 0,
    weeklyRevenue: 0,
    topDishes: [],
    cancellationRate: 0,
  },
  reviews: [],
};

const sellerSlice = createSlice({
  name: 'seller',
  initialState,
  reducers: {
    setOrders: (state, action: PayloadAction<Order[]>) => {
      state.orders = action.payload;
    },
    updateOrderStatus: (state, action: PayloadAction<{ id: string; status: string }>) => {
      const order = state.orders.find(o => o.id === action.payload.id);
      if (order) order.status = action.payload.status;
    },
    setMenu: (state, action: PayloadAction<any[]>) => {
      state.menu = action.payload;
    },
    toggleRushMode: (state) => {
      state.settings.isRushMode = !state.settings.isRushMode;
    },
    setAnalytics: (state, action: PayloadAction<any>) => {
      state.analytics = action.payload;
    },
    setReviews: (state, action: PayloadAction<any[]>) => {
      state.reviews = action.payload;
    },
  },
});

export const { setOrders, updateOrderStatus, setMenu, toggleRushMode, setAnalytics, setReviews } = sellerSlice.actions;

export const store = configureStore({
  reducer: {
    seller: sellerSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
