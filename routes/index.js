import express from 'express';
import user from './users.js';
import admin from './admin.js';
import product from './product.js';

const router = express.Router();

// Welcome Page
router.get('/', (req, res) => res.json('welcome'));

//user
router.use('/user', user);
//admin
router.use('/admin', admin);
router.use('/product', product);
export default router;
