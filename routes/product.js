import express from 'express';

const router = express.Router();

// Import the product controller
import productController from '../controllers/ProductController.js';


// Define the product routes
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);
router.post('/', productController.createProduct);
router.put('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

export default router;
