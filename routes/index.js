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
            routes:
            {
                user: {
                    login: '/api/v1/user/login',
                    register: '/api/v1/user/register',
                    logout: '/api/v1/user/logout',
                    profile: '/api/v1/user/profile',
                    update: '/api/v1/user/update',
                    delete: '/api/v1/user/delete',
                },
                admin: {
                    login: '/api/v1/admin/login',
                    register: '/api/v1/admin/register',
                    logout: '/api/v1/admin/logout',
                    profile: '/api/v1/admin/profile',
                    update: '/api/v1/admin/update',
                    delete: '/api/v1/admin/delete',
                },
                product: {
                    add: '/api/v1/product/add',
                    update: '/api/v1/product/update',
                    delete: '/api/v1/product/delete',
                    get: '/api/v1/product/get',
                    getall: '/api/v1/product/getall',
                }
            }
        }
    );
}
);
router.use('/user', user);
router.use('/admin', admin);
router.use('/product', product);
export default router;
