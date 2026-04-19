import { NextRequest } from 'next/server';
import express from 'express';
import apiRoutes from '@/server/api/routes/index.js';
import { connectDB } from '@/server/db/mongoose.js';

// This is a bridge to allow Express routes to run inside Next.js API Routes
const app = express();
app.use(express.json());

// Connect DB (lazy)
let isConnected = false;
const ensureDB = async () => {
  if (!isConnected) {
    await connectDB();
    isConnected = true;
  }
};

app.use(async (req, res, next) => {
  await ensureDB();
  next();
});

app.use('/', apiRoutes);

// Helper to convert NextRequest to Express-like req and handle response
async function handleRequest(req: NextRequest) {
  // This is complex to implement fully, but for simple APIs it works.
  // However, Next.js 15+ has better ways.
  // Actually, it's better to just use Next.js API routes directly for each file.
}

// But wait, there's a simpler way: just use Next.js API routes for each entity.
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  return new Response(JSON.stringify({ message: "API Bridge - Please use specific routes" }), { status: 200 });
}
