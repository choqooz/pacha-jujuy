import express from 'express';
import {
  createCart,
  updateCart,
  deleteCart,
  getUserCart,
  getAllCarts,
  getCartById,
} from '../controllers/cart.controller.js';
import {
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
} from '../middlewares/verifyToken.js';

const router = express.Router();

router.post('/', createCart);

router.put('/:id', verifyTokenAndAuthorization, updateCart);

router.delete('/:id', verifyTokenAndAuthorization, deleteCart);

router.get('/find/:userId', verifyTokenAndAuthorization, getUserCart);

router.get('/', verifyTokenAndAdmin, getAllCarts);

router.get('/:id', getCartById);

export default router;
