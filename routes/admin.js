import express from 'express';

const router = express.Router();

// Import your admin controllers
import {
    createProduct,
    updateProduct,
    deleteProduct,
    getAllOrders,
    getOrderById,
    updateOrderStatus
} from '../controllers/admin';

// Import your middleware
const { requireSignin, isAdmin } = require('../middlewares/auth');

// Admin routes
router.post('/product/create', requireSignin, isAdmin, createProduct);
router.put('/product/:productId', requireSignin, isAdmin, updateProduct);
router.delete('/product/:productId', requireSignin, isAdmin, deleteProduct);
router.get('/orders', requireSignin, isAdmin, getAllOrders);
router.get('/order/:orderId', requireSignin, isAdmin, getOrderById);
router.put('/order/:orderId/status', requireSignin, isAdmin, updateOrderStatus);

export default router;
