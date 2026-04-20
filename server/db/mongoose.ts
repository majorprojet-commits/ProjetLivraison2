import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { SellerModel } from './models/Seller.js';
import { UserModel } from './models/User.js';
import { OrderModel } from './models/Order.js';

const SEED_SELLERS = [
  {
    _id: 'r1',
    name: 'Le Terroir Camerounais',
    rating: 4.9,
    deliveryTime: '25-40 min',
    deliveryFee: 500,
    tags: ['Camerounais', 'Traditionnel', 'Ndolé', 'Poulet DG'],
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80',
    type: 'restaurant',
    menu: [
      { 
        id: 'm1', 
        name: 'Ndolé Royal', 
        price: 3500, 
        description: 'Plat traditionnel à base de feuilles de ndolé, arachides, viande de bœuf et crevettes. Servi avec miondo.', 
        image: 'https://picsum.photos/seed/ndole/200/200',
        options: [
          {
            id: 'opt1',
            name: 'Accompagnement',
            required: true,
            choices: [
              { id: 'c1', name: 'Miondo', priceExtra: 0 },
              { id: 'c2', name: 'Plantain bouilli', priceExtra: 0 },
              { id: 'c3', name: 'Plantain frit', priceExtra: 200 },
              { id: 'c4', name: 'Riz', priceExtra: 0 }
            ]
          },
          {
            id: 'opt2',
            name: 'Suppléments Crevettes',
            required: false,
            choices: [
              { id: 'c5', name: 'Petite portion', priceExtra: 500 },
              { id: 'c6', name: 'Grande portion', priceExtra: 1000 }
            ]
          }
        ]
      },
      { id: 'm2', name: 'Poulet DG', price: 4500, description: 'Poulet frit avec plantains mûrs, carottes, haricots verts et poivrons.', image: 'https://picsum.photos/seed/pouletdg/200/200' },
      { id: 'm3', name: 'Poisson Braisé (Bar)', price: 5000, description: 'Bar frais braisé au feu de bois avec épices locales.', image: 'https://picsum.photos/seed/fish/200/200' },
    ]
  },
  {
    _id: 'r2',
    name: 'Saveurs de l\'Ouest',
    rating: 4.8,
    deliveryTime: '30-50 min',
    deliveryFee: 700,
    tags: ['Achu', 'Kondre', 'Traditionnel'],
    image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80',
    type: 'restaurant',
    menu: [
      { id: 'm4', name: 'Achu (Yellow Soup)', price: 3000, description: 'Taro pilé servi avec la célèbre sauce jaune et peau de bœuf.', image: 'https://picsum.photos/seed/achu/200/200' },
      { id: 'm5', name: 'Kocki (Gâteau de Corn)', price: 1500, description: 'Gâteau de haricots cornille à l\'huile de palme.', image: 'https://picsum.photos/seed/koki/200/200' },
    ]
  },
  {
    _id: 'r3',
    name: 'Boulangerie du Littoral',
    rating: 4.7,
    deliveryTime: '15-25 min',
    deliveryFee: 300,
    tags: ['Pâtisserie', 'Petit-déjeuner'],
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
    type: 'restaurant',
    menu: [
      { id: 'm6', name: 'Beignets Haricot Bouillie', price: 500, description: 'Le petit déjeuner classique camerounais.', image: 'https://picsum.photos/seed/beignets/200/200' },
      { id: 'm7', name: 'Pain Chargé (Spaghetti)', price: 800, description: 'Pain frais garni de spaghettis sautés et omelette.', image: 'https://picsum.photos/seed/sandwich/200/200' },
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
    const count = await SellerModel.countDocuments();
    if (count === 0) {
      console.log('🌱 Seeding database...');
      await SellerModel.insertMany(SEED_SELLERS);
      console.log('✅ Database seeded');
    }
  } catch (seedError) {
    console.error('❌ Seeding Error:', seedError);
  }
};
