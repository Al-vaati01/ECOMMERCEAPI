import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import router from './routes/index.js';
import {sessionConfig} from './middleware/sessionConfig.js';

// Load environment variables
dotenv.config();

// Set up port
const port = process.env.PORT || 5000;

const app = express();

// Allow CORS
app.use(cors());
// Parse JSON
app.use(express.json({limit:'200mb'}));
// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));
// Use session
app.use(sessionConfig);

// Routes
app.use('/api/v1', router);
// Start the server

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
