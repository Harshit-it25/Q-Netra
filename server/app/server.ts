import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
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

  if (!SERVER_CONFIG.isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const server = app.listen(SERVER_CONFIG.port, '0.0.0.0', () => {
    console.log(`Q-NETRA AI Server running on http://localhost:${SERVER_CONFIG.port}`);
  });

  return server;
}
