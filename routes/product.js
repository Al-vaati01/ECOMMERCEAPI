import express from 'express';

const router = express.Router();

// Import the product controller
import productController from '../controllers/ProductController.js';


// Define the product routes
router.post('/create', productController.createProduct);
router.put('/:productId', productController.updateProduct);
router.delete('/:productId', productController.deleteProduct);

export default router;
