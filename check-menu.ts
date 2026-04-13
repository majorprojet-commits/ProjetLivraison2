import { connectDB } from './server/db/mongoose.js';
import { RestaurantModel } from './server/db/models/Restaurant.js';
import mongoose from 'mongoose';

async function checkMenu() {
  await connectDB();
  const restaurant = await RestaurantModel.findById('r1');
  if (restaurant) {
    console.log('Restaurant r1 menu:', JSON.stringify(restaurant.menu, null, 2));
  } else {
    console.log('Restaurant r1 not found');
  }
  process.exit(0);
}

checkMenu().catch(err => {
  console.error(err);
  process.exit(1);
});
