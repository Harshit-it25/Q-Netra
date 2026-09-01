import express from 'express';
import path from 'path';
import fs from 'fs';
import { SERVER_CONFIG } from './config';
import { corsMiddleware } from '../middleware/cors';
import { securityHeadersMiddleware } from '../middleware/securityHeaders';
import { errorHandlerMiddleware } from '../middleware/errorHandler';
import { apiRouter } from './routes';

export function createApp() {
  const app = express();

  // 1. CORS Security
  app.use(corsMiddleware);

  // 2. Production Security Headers
  app.use(securityHeadersMiddleware);

  // 3. Request Body Parser (Bounded Size)
  app.use(express.json({ limit: '256kb' }));

  // 4. API Routes
  app.use('/api', apiRouter);

  // 5. Centralized Error Handler
  app.use(errorHandlerMiddleware);

  return app;
}

export async function startServer() {
  const app = createApp();

  // Robustly resolve production dist directory across local and containerized runtimes
  let distDir = path.join(process.cwd(), 'dist');
  if (!fs.existsSync(path.join(distDir, 'index.html')) && typeof __dirname !== 'undefined') {
    if (fs.existsSync(path.join(__dirname, 'index.html'))) {
      distDir = __dirname;
    } else if (fs.existsSync(path.join(__dirname, '..', 'dist', 'index.html'))) {
      distDir = path.join(__dirname, '..', 'dist');
    }
  }

  const isDistAvailable = fs.existsSync(path.join(distDir, 'index.html'));

  if (!isDistAvailable && process.env.NODE_ENV !== 'production') {
    try {
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa'
      });
      app.use(vite.middlewares);
      console.log('Q-NETRA AI running with dynamic Vite development middleware');
    } catch (err) {
      console.warn('Vite dev middleware unavailable, serving static dist fallback');
    }
  } else {
    console.log(`Q-NETRA AI serving production build from: ${distDir}`);
    app.use(express.static(distDir));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api')) {
        return next();
      }
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  const port = Number(process.env.PORT) || SERVER_CONFIG.port || 3000;
  const server = app.listen(port, '0.0.0.0', () => {
    console.log(`Q-NETRA AI Server listening on 0.0.0.0:${port} (NODE_ENV=${process.env.NODE_ENV || 'production'})`);
  });

  return server;
}
