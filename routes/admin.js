import express from 'express';
import AdminController from '../controllers/AdminController.js';
import Auth from '../middleware/auth.js';
import AuthController from '../controllers/AuthController.js';

const router = express.Router();

//ADMIN ROUTES
router.post('/login', Auth.verifyToken, Auth.isAdmin, AuthController.connect);
router.post('/logout', Auth.verifyToken, Auth.isAdmin, AuthController.disconnect);
router.get('/users', Auth.verifyToken, Auth.isAdmin, AdminController.getAllUsers);
router.post('/signup', Auth.verifyToken, Auth.isAdmin, AdminController.createUser);
router.get('/user/:userId', Auth.verifyToken, Auth.isAdmin, AdminController.getUser);
router.put('/user/:userId', Auth.verifyToken, Auth.isAdmin, AdminController.updateUser);
router.delete('/user/:userId', Auth.verifyToken, Auth.isAdmin, AdminController.deleteUser);
// router.post('/product/create', Auth.verifyToken, isAdmin, AdminController.createProduct);
// router.put('/product/:productId', Auth.verifyToken, isAdmin, AdminController.updateProduct);
// router.delete('/product/:productId', Auth.verifyToken, isAdmin, AdminController.deleteProduct);
// router.get('/orders', Auth.verifyToken, isAdmin, AdminController.getAllOrders);
// router.get('/order/:orderId', Auth.verifyToken, isAdmin, AdminController.getOrderById);
// router.put('/order/:orderId/status', Auth.verifyToken, isAdmin, AdminController.updateOrderStatus);
// router.post('/category/create', Auth.verifyToken, isAdmin, AdminController.createCategory);
// router.get('/categories', Auth.verifyToken, isAdmin, AdminController.getAllCategories);
// router.get('/category/:categoryId', Auth.verifyToken, isAdmin, AdminController.getCategoryById);
// router.put('/category/:categoryId', Auth.verifyToken, isAdmin, AdminController.updateCategory);
// router.delete('/category/:categoryId', Auth.verifyToken, isAdmin, AdminController.deleteCategory);

export default router;
