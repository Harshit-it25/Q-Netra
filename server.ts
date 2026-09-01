import { startServer } from './server/app/server';

startServer().catch((err) => {
  console.error('Fatal error during Q-NETRA AI server boot:', err);
  process.exit(1);
});
