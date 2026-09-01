import { Request, Response, NextFunction } from 'express';
import { SERVER_CONFIG } from '../app/config';

/**
 * Environment-aware CORS middleware.
 * Allows local development origins and explicitly configured production origins.
 */
export function corsMiddleware(req: Request, res: Response, next: NextFunction) {
  const origin = req.headers.origin;

  // Allow same-origin / non-browser requests (e.g. mobile app, curl, server-to-server)
  if (!origin) {
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    return next();
  }

  const normalizedOrigin = origin.toLowerCase();
  const isLocalDev =
    !SERVER_CONFIG.isProduction &&
    (normalizedOrigin.startsWith('http://localhost:') ||
      normalizedOrigin.startsWith('http://127.0.0.1:') ||
      normalizedOrigin.startsWith('http://0.0.0.0:'));

  const isExplicitlyAllowed = SERVER_CONFIG.allowedOrigins.includes(normalizedOrigin);

  if (isLocalDev || isExplicitlyAllowed) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    return next();
  }

  // Reject unauthorized cross-origin requests
  if (req.method === 'OPTIONS') {
    return res.status(403).json({ error: 'CORS origin forbidden' });
  }
  return res.status(403).json({ error: 'Cross-Origin Request Blocked by Q-NETRA Security Policy' });
}
