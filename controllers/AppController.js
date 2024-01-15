import { sessionConfig } from '../middleware/sessionConfig.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import router from '../routes/index.js';




class AppController {
    constructor(app) {
        this.app = app;
        this.initializeMiddlewares();
        this.initializeRoutes();
    }

    initializeMiddlewares() {
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
        this.app.use(cookieParser());
        this.app.use(cors());
        this.app.use(express.json({ limit: '200mb' }));
        this.app.use(express.urlencoded({ extended: true }));
        this.app.use(sessionConfig);
    }

    initializeRoutes() {
        // Welcome Page
        this.app.use('/', (req, res) => {
            res.send(
                {
                    status: 'OK',
                    message: 'Welcome e-com API',
                    rooutes:
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
            ).status(200);
        });
        this.app.use('/api/v1', router);
    }
}

export default AppController;
