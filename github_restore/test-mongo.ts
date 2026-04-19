import { connectDB } from './server/db/mongoose.js';
import mongoose from 'mongoose';

async function test() {
  console.log('Starting DB connection test...');
  await connectDB();
  
  const collections = await mongoose.connection.db.listCollections().toArray();
  console.log('Collections found:', collections.map(c => c.name));
  
  if (collections.length === 0) {
    console.log('No collections found. This might be because the database is empty or the connection string points to a new database.');
  }
  
  process.exit(0);
}

test().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
