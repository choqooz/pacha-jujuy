import express from 'express';
import {
  createProduct,
  updateProduct,
  deleteProduct,
  getProductById,
  getAllProducts,
} from '../controllers/product.controller.js';
import { verifyTokenAndAdmin } from '../middlewares/verifyToken.js';

const router = express.Router();

router.post('/', verifyTokenAndAdmin, createProduct);

router.put('/:id', verifyTokenAndAdmin, updateProduct);

router.delete('/:id', verifyTokenAndAdmin, deleteProduct);

router.get('/find/:id', getProductById);

router.get('/', getAllProducts);

export default router;
