import dotenv from 'dotenv';
import express from 'express';
import AppController from './controllers/AppController.js';
import { once } from 'events';



// Load environment variables
dotenv.config();

const port = process.env.PORT || 3000;
const app = express();

once(process, 'redisReady')
    .then(() => {
        const appController = new AppController(app);
        appController.initializeMiddlewares();
        appController.initializeRoutes();

    })
    .catch(err => {
        console.error('REDIS ERROR: ', err);
    });

app.use((err, req, res, next) => {
    if (err) {
        if (res.statusCode === 404) {
            return res.status(404).json({ error: 'Not Found' });
        } else if (res.statusCode === 500) {
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        return res.status(500).json({ error: 'Something went wrong' });
    }
    next();
});

//(Route not found)
app.use((req, res, next) => {
    if (res.statusCode === 404) {
        return res.status(404).json({ error: 'Not Found' });
    }
    next();
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});

