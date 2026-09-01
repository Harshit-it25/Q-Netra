import express from 'express';
import path from 'path';
import fs from 'fs';
import { SERVER_CONFIG } from './config';
import { corsMiddleware } from '../middleware/cors';
import { securityHeadersMiddleware } from '../middleware/securityHeaders';
import { errorHandlerMiddleware } from '../middleware/errorHandler';
import { apiRouter } from './routes';

import http from 'http';

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

export async function startServer(preferredPort?: number): Promise<any> {
  const isProduction = process.env.NODE_ENV === 'production';
  const app = createApp();
  const httpServer = http.createServer(app);

  if (!isProduction) {
    try {
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        server: {
          middlewareMode: true,
          hmr: { server: httpServer }
        },
        appType: 'spa'
      });
      app.use(vite.middlewares);
      console.log('Q-NETRA AI running in DEVELOPMENT mode with integrated Vite live HMR middleware');
    } catch (err) {
      console.warn('Vite dev middleware initialization error, serving static dist fallback:', err);
    }
  } else {
    // Robustly resolve production dist directory across local and containerized runtimes
    let distDir = path.join(process.cwd(), 'dist');
    if (!fs.existsSync(path.join(distDir, 'index.html')) && typeof __dirname !== 'undefined') {
      if (fs.existsSync(path.join(__dirname, 'index.html'))) {
        distDir = __dirname;
      } else if (fs.existsSync(path.join(__dirname, '..', 'dist', 'index.html'))) {
        distDir = path.join(__dirname, '..', 'dist');
      }
    }

    console.log(`Q-NETRA AI serving production build from: ${distDir}`);
    app.use(express.static(distDir, { maxAge: '1h', etag: true }));

    // 404 for missing static assets to prevent HTML MIME type pollution on outdated chunk requests
    app.use('/assets', (_req, res) => {
      res.status(404).json({ error: 'Static asset not found' });
    });

    // SPA Wildcard Route for clean HTML navigation
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api')) {
        return next();
      }
      if (path.extname(req.path)) {
        return res.status(404).send('Asset not found');
      }
      res.sendFile(path.join(distDir, 'index.html'), (err) => {
        if (err) {
          next(err);
        }
      });
    });
  }

  const initialPort = preferredPort || Number(process.env.PORT) || SERVER_CONFIG.port || 3000;

  return new Promise((resolve, reject) => {
    function tryListen(portToTry: number) {
      httpServer.listen(portToTry, '0.0.0.0', () => {
        console.log(`Q-NETRA AI Server listening on http://localhost:${portToTry} (NODE_ENV=${process.env.NODE_ENV || 'development'})`);
        resolve(httpServer);
      });

      httpServer.once('error', (err: any) => {
        if (err.code === 'EADDRINUSE' && !isProduction && portToTry < initialPort + 10) {
          console.warn(`Port ${portToTry} is in use, automatically trying port ${portToTry + 1}...`);
          tryListen(portToTry + 1);
        } else {
          reject(err);
        }
      });
    }

    tryListen(initialPort);
  });
}
