import express from 'express';
import AdminController from '../controllers/AdminController.js';
import { requireSignin, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Admin routes
router.post('/product/create', requireSignin, isAdmin, AdminController.createProduct);
router.put('/product/:productId', requireSignin, isAdmin, AdminController.updateProduct);
router.delete('/product/:productId', requireSignin, isAdmin, AdminController.deleteProduct);
router.get('/orders', requireSignin, isAdmin, AdminController.getAllOrders);
router.get('/order/:orderId', requireSignin, isAdmin, AdminController.getOrderById);
router.put('/order/:orderId/status', requireSignin, isAdmin, AdminController.updateOrderStatus);

export default router;
