import dotenv from 'dotenv';
import express from 'express';
import AppController from './controllers/AppController.js';

// Load environment variables
dotenv.config();

const port = process.env.PORT || 3000;
const app = express();
if (app.get('env') === 'production') {
    sess.cookie.secure = true // serve secure cookies
}
// Initialize the app
const appController = new AppController(app);
appController.initializeMiddlewares();
appController.initializeRoutes();
// Start the server
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Server Error');
}
);
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});

