import express from 'express';

const router = express.Router();

// Import the product controller
import productController from '../controllers/ProductController.js';
import Auth from '../middleware/auth.js';


// Define the product routes
router.post('/create', productController.createProduct);
router.put('/:productId', Auth.verifyToken, Auth.isAdmin, productController.updateProduct);
router.delete('/:productId',Auth.verifyToken,Auth.isAdmin, productController.deleteProduct);
router.get('/', productController.getAllProducts);

export default router;
