import express from 'express';
import {
  updateUser,
  deleteUser,
  getUserById,
  getAllUsers,
  getUserStats,
} from '../controllers/user.controller.js';
import {
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
} from '../middlewares/verifyToken.js';

const router = express.Router();

router.put('/:id', verifyTokenAndAuthorization, updateUser);

router.delete('/:id', verifyTokenAndAuthorization, deleteUser);

router.get('/find/:id', verifyTokenAndAdmin, getUserById);

router.get('/', verifyTokenAndAdmin, getAllUsers);

router.get('/stats', verifyTokenAndAdmin, getUserStats);

export default router;
