import { Request, Response, NextFunction } from 'express';

interface RateLimitBucket {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitBucket>();

// Periodic cleanup of expired rate limit buckets to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of rateLimitMap.entries()) {
    if (now > bucket.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}, 60000);

/**
 * Creates in-memory rate limiting middleware with IP and route scoping.
 */
export function createRateLimiter(maxRequests: number, windowMs: number = 60000) {
  return (req: Request, res: Response, next: NextFunction) => {
    const clientIp =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.socket.remoteAddress ||
      'unknown_ip';

    const bucketKey = `${req.baseUrl || ''}${req.path}:${clientIp}`;
    const now = Date.now();

    let bucket = rateLimitMap.get(bucketKey);
    if (!bucket || now > bucket.resetTime) {
      bucket = { count: 1, resetTime: now + windowMs };
      rateLimitMap.set(bucketKey, bucket);
      return next();
    }

    bucket.count += 1;
    if (bucket.count > maxRequests) {
      return res.status(429).json({
        success: false,
        error: 'Too many requests. Rate limit exceeded. Please retry shortly.'
      });
    }

    next();
  };
}

export const standardApiLimiter = createRateLimiter(120, 60000);
export const aiAdvisorLimiter = createRateLimiter(30, 60000);
export const voiceApiLimiter = createRateLimiter(60, 60000);
