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

export default router;
