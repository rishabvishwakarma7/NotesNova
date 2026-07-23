import { clerkClient } from '@clerk/express';

export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const token = authHeader.split(' ')[1];
    // In production, verify the Clerk session token
    // For development, we accept userId from the token payload
    try {
      const { sub } = JSON.parse(atob(token.split('.')[1]));
      req.userId = sub;
    } catch {
      req.userId = token; // Fallback: treat token as userId directly
    }
    next();
  } catch (err) {
    res.status(401).json({ error: 'Authentication failed' });
  }
};
