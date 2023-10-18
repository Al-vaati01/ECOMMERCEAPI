import express from 'express';
import UserController from '../controllers/UserController.js';
import AuthController from '../controllers/AuthController.js';
import Auth from '../middleware/auth.js';

const router = express.Router();

// Define user routes
router.post('/signup', UserController.createUser);
router.post('/login', AuthController.connect);
router.get('/logout',Auth.isUser, AuthController.disconnect);
router.get('/cart',Auth.isUser, UserController.getCart);
router.put('/cart:items',Auth.isUser, UserController.updateCart);
router.put('/reset', Auth.isUser, UserController.resetPassword);
export default router;
