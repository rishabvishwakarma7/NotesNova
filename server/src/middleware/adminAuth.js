/**
 * Admin authentication middleware.
 * Checks for a secret token passed as Bearer in Authorization header,
 * or as ?token= query param (for quick browser testing).
 */
export const requireAdmin = (req, res, next) => {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) {
    return res.status(503).json({ error: 'Admin panel not configured.' });
  }

  const authHeader = req.headers.authorization;
  const tokenFromHeader = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  const tokenFromQuery = req.query.token;
  const token = tokenFromHeader || tokenFromQuery;

  if (!token || token !== secret) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  next();
};
