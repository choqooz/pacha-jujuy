import express from 'express';
import { verifyToken } from '../middlewares/verifyToken.js';
import {
  createPaymentPreference,
  processWebhook,
} from '../controllers/mercadoPago.controller.js';

const router = express.Router();

// Create payment preference
router.post('/', verifyToken, createPaymentPreference);

// Process webhook notifications
router.post('/webhook', processWebhook);

export default router;
