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

// Start the server
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Server Error');
}
);
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});

