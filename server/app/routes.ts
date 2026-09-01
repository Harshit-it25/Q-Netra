import { Router } from 'express';
import { paymentRouter } from '../routes/paymentRoutes';
import { networkRouter } from '../routes/networkRoutes';
import { messageRouter } from '../routes/messageRoutes';
import { advisorRouter } from '../routes/advisorRoutes';
import { voiceRouter } from '../routes/voiceRoutes';
import { healthRouter } from '../routes/healthRoutes';
import { standardApiLimiter } from '../middleware/rateLimit';

export const apiRouter = Router();

apiRouter.use(standardApiLimiter);
apiRouter.use('/', healthRouter);
apiRouter.use('/', paymentRouter);
apiRouter.use('/', networkRouter);
apiRouter.use('/', messageRouter);
apiRouter.use('/', advisorRouter);
apiRouter.use('/', voiceRouter);

