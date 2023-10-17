const express = require('express');
const router = express.Router();

// Import the product controller
const productController = require('../controllers/product');
const e = require('express');

// Define the product routes
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);
router.post('/', productController.createProduct);
router.put('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

export default router;
