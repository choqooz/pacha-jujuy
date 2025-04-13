import express from 'express';
import {
  createOrder,
  updateOrder,
  deleteOrder,
  getUserOrders,
  getAllOrders,
  getMonthlyIncome,
} from '../controllers/order.controller.js';
import {
  verifyToken,
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
} from '../middlewares/verifyToken.js';

const router = express.Router();

router.post('/', verifyToken, createOrder);

router.put('/:id', verifyTokenAndAdmin, updateOrder);

router.delete('/:id', verifyTokenAndAdmin, deleteOrder);

router.get('/find/:userId', verifyTokenAndAuthorization, getUserOrders);

router.get('/', verifyTokenAndAdmin, getAllOrders);

router.get('/income', verifyTokenAndAdmin, getMonthlyIncome);

export default router;
