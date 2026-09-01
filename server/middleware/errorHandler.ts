import { Request, Response, NextFunction } from 'express';

/**
 * Centralized error handler preventing stack trace or internal path leakage.
 */
export function errorHandlerMiddleware(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error('Unhandled server error:', err);

  const status = err.status || err.statusCode || 500;
  const message = status === 500 ? 'Internal server error' : err.message || 'Operation failed';

  res.status(status).json({
    success: false,
    error: message
  });
}
