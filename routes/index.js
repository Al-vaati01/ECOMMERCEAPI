import express from 'express';
import user from './users.js';
import admin from './admin.js';
import product from './product.js';


const router = express.Router();

// Welcome Page
router.get('/', (req, res) => {
    res.send(
        {
            status: 'OK',
            message: 'Welcome e-com API'
        }
    ).status(200);
}
);
router.use('/user', user);
router.use('/admin', admin);
router.use('/product', product);
export default router;
