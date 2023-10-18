import express from 'express';
import UserController from '../controllers/UserController.js';

const router = express.Router();

// Define user routes
router.post('/signup', UserController.signup);
router.get('/', (req, res) => {
    res.send('user home');
});

router.get('/:id', (req, res) => {
    res.send(`Get user with id ${req.params.id}`);
});

router.post('/', (req, res) => {
    res.send('Create a new user');
});

router.put('/:id', (req, res) => {
    res.send(`Update user with id ${req.params.id}`);
});

router.delete('/:id', (req, res) => {
    res.send(`Delete user with id ${req.params.id}`);
});

export default router;
