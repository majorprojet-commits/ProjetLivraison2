import { connectDB } from './server/db/mongoose.js';
import { SellerModel } from './server/db/models/Seller.js';
import mongoose from 'mongoose';

async function checkMenu() {
  await connectDB();
  const seller = await SellerModel.findById('r1');
  if (seller) {
    console.log('Seller r1 menu:', JSON.stringify(seller.menu, null, 2));
  } else {
    console.log('Seller r1 not found');
  }
  process.exit(0);
}

checkMenu().catch(err => {
  console.error(err);
  process.exit(1);
});
