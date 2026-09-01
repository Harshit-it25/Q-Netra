import { Request, Response, NextFunction } from 'express';

/**
 * Production-grade security headers middleware.
 * Enforces CSP, Frame-Options, Content-Type Options, and Permissions Policy.
 */
export function securityHeadersMiddleware(req: Request, res: Response, next: NextFunction) {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' blob:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob: https:; media-src 'self' blob: mediastream:; connect-src 'self' https://generativelanguage.googleapis.com https://dhruva-api.bhashini.gov.in https://fonts.googleapis.com https://fonts.gstatic.com data: blob:; worker-src 'self' blob:; frame-ancestors 'none'; object-src 'none';"
  );
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(self), microphone=(self), geolocation=()');

  if (req.secure || req.headers['x-forwarded-proto'] === 'https') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }

  next();
}
