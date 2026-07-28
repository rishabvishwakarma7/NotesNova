import User from '../models/User.js';

// Sync user from Clerk to MongoDB (called from client after sign-up/sign-in)
export const syncUser = async (req, res) => {
  try {
    const { clerkId, name, email, profileImage } = req.body;
    const targetClerkId = req.userId || clerkId;

    if (!targetClerkId || !email) {
      return res.status(400).json({ error: 'clerkId and email are required' });
    }

    if (req.userId && clerkId && req.userId !== clerkId) {
      return res.status(403).json({ error: 'Forbidden: Cannot sync another user profile' });
    }

    // Upsert: create if not exists, update if exists
    const user = await User.findOneAndUpdate(
      { clerkId: targetClerkId },
      {
        clerkId: targetClerkId,
        name: name || 'User',
        email,
        profileImage: profileImage || '',
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    console.log(`✅ User synced: ${email} (${targetClerkId})`);
    res.json({ success: true, user });
  } catch (err) {
    console.error('❌ User sync error:', err.message);
    res.status(500).json({ error: 'Failed to sync user' });
  }
};

// Get user profile from MongoDB
export const getUser = async (req, res) => {
  try {
    const user = await User.findOne({ clerkId: req.userId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get user' });
  }
};
