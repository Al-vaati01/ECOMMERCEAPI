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
        this.app.use('/api/v1', router);
    }
}

export default AppController;
