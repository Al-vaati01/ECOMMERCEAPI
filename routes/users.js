import express from 'express';
import UserController from '../controllers/UserController.js';
import AuthController from '../controllers/AuthController.js';
import rateLimit from 'express-rate-limit';
import Auth from '../middleware/auth.js';

const router = express.Router();
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 requests per windowMs
    message: "Too many login attempts, please try again later."
  });
// Define user routes
router.post('/signup', UserController.createUser);
router.post('/login',limiter, Auth.verifyToken,AuthController.connect);
router.get('/logout',Auth, AuthController.disconnect);
router.get('/cart',Auth, UserController.getCart);
router.put('/cart:items',Auth, UserController.updateCart);
router.put('/reset', Auth, UserController.resetPassword);
router.put('/update', Auth, UserController.updateUserById);
router.delete('/delete', Auth, UserController.deleteAccount);

router.get('/me', Auth, (req, res) => {

    res.status(200).json({ success: true, data: req.session.User });
});
export default router;
