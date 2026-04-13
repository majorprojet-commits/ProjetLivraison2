import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { RestaurantModel } from './models/Restaurant.js';
import { UserModel } from './models/User.js';
import { OrderModel } from './models/Order.js';

const SEED_RESTAURANTS = [
  {
    _id: 'r1',
    name: 'Burger & Co',
    rating: 4.8,
    deliveryTime: '20-30 min',
    deliveryFee: 2.99,
    tags: ['Burgers', 'Américain', 'Fast Food'],
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
    menu: [
      { id: 'm1', name: 'Classic Cheeseburger', price: 8.99, description: 'Bœuf, cheddar, salade, tomate, sauce maison', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=200&q=80' },
      { id: 'm2', name: 'Double Bacon Burger', price: 11.99, description: 'Double bœuf, double bacon, cheddar', image: 'https://images.unsplash.com/photo-1594212202875-86ac4ce40b6b?auto=format&fit=crop&w=200&q=80' },
      { id: 'm3', name: 'Frites Maison', price: 3.50, description: 'Portion généreuse de frites croustillantes', image: 'https://images.unsplash.com/photo-1576107232684-1279f390859f?auto=format&fit=crop&w=200&q=80' },
    ]
  },
  {
    _id: 'r2',
    name: 'Sushi Master',
    rating: 4.9,
    deliveryTime: '35-45 min',
    deliveryFee: 0,
    tags: ['Japonais', 'Sushi', 'Sain'],
    image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=800&q=80',
    menu: [
      { id: 'm4', name: 'Plateau Maki Mix (18p)', price: 18.50, description: 'Saumon, thon, avocat, cheese', image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=200&q=80' },
      { id: 'm5', name: 'California Rolls (8p)', price: 7.90, description: 'Saumon, avocat, sésame', image: 'https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=200&q=80' },
    ]
  },
  {
    _id: 'r3',
    name: 'Pizza Napoli',
    rating: 4.6,
    deliveryTime: '25-40 min',
    deliveryFee: 1.49,
    tags: ['Italien', 'Pizza', 'Comfort Food'],
    image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=800&q=80',
    menu: [
      { id: 'm6', name: 'Pizza Margherita', price: 12.00, description: 'Sauce tomate, mozzarella di bufala, basilic', image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=200&q=80' },
      { id: 'm7', name: 'Pizza 4 Fromages', price: 15.50, description: 'Mozzarella, gorgonzola, chèvre, parmesan', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=200&q=80' },
    ]
  }
];

let mongoServer: MongoMemoryServer | null = null;

export const connectDB = async () => {
  let uri = process.env.MONGODB_URI;
  const isPlaceholder = uri && (uri.includes('<db_password>') || uri.includes('TODO'));

  try {
    if (!uri || uri.includes('localhost') || isPlaceholder) {
      console.log('⚠️ MONGODB_URI is missing or contains placeholder. Using In-Memory MongoDB.');
      mongoServer = await MongoMemoryServer.create();
      uri = mongoServer.getUri();
    }

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    });
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB Connection Failed:', error);
    
    // Fallback if not already using memory server
    if (!mongoServer) {
      try {
        console.log('🔄 Attempting fallback to In-Memory MongoDB...');
        mongoServer = await MongoMemoryServer.create();
        const fallbackUri = mongoServer.getUri();
        await mongoose.connect(fallbackUri);
        console.log('✅ Fallback MongoDB Connected');
      } catch (fallbackError) {
        console.error('❌ Fallback MongoDB also failed:', fallbackError);
      }
    }
  }

  try {
    // Seed Data
    const count = await RestaurantModel.countDocuments();
    if (count === 0) {
      console.log('🌱 Seeding database...');
      await RestaurantModel.insertMany(SEED_RESTAURANTS);
      console.log('✅ Database seeded');
    }
  } catch (seedError) {
    console.error('❌ Seeding Error:', seedError);
  }
};
