import mongoose from 'mongoose';
import dns from 'dns';

// Fix for DNS SRV lookup issues in some hosting environments
try {
  dns.setDefaultResultOrder?.('ipv4first');
} catch (err) {
  console.log('ℹ️  DNS config skipped');
}

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn('⚠️  MONGODB_URI not set. Running without database.');
    return;
  }
  try {
    await mongoose.connect(uri);
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  }
};
