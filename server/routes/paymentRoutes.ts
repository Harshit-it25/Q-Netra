import { Router } from 'express';
import { paymentController } from '../controllers/paymentController';

export const paymentRouter = Router();

paymentRouter.post('/analyze-payment', (req, res) => paymentController.handlePaymentCheck(req, res));
paymentRouter.post('/v1/payment/check', (req, res) => paymentController.handlePaymentCheck(req, res));
paymentRouter.post('/checks', (req, res) => paymentController.handlePaymentCheck(req, res));
paymentRouter.get('/entities', (req, res) => paymentController.getEntities(req, res));
