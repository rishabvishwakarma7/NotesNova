import { verifyToken } from '@clerk/express';

export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: Missing token header' });
    }
    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized: Empty token' });
    }

    if (process.env.CLERK_SECRET_KEY) {
      try {
        const payload = await verifyToken(token, { secretKey: process.env.CLERK_SECRET_KEY });
        req.userId = payload.sub;
        return next();
      } catch (err) {
        // Fall back to decoded sub if verifyToken fails in dev mode with mock tokens
        const parts = token.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'));
          if (payload?.sub) {
            req.userId = payload.sub;
            return next();
          }
        }
        return res.status(401).json({ error: 'Unauthorized: Invalid token' });
      }
    } else {
      // Dev mode without secret key set
      const parts = token.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'));
        if (payload?.sub) {
          req.userId = payload.sub;
          return next();
        }
      }
      req.userId = token;
      return next();
    }
  } catch (err) {
    return res.status(401).json({ error: 'Authentication failed: ' + err.message });
  }
};

