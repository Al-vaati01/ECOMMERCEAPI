import { User } from '../schema/User.js';
import { Cart } from '../schema/Cart.js';
import Auth from '../middleware/auth.js';
import { v4 as uuidv4 } from 'uuid';
import redisClient from '../utils/redis.js';


class UserController {
    // Method to get all users
    static async getAllUsers(_, res) {
        try {
            const users = await User.find();
            res.status(200).json({ success: true, data: users });
        } catch (error) {
            res.status(500).json({ success: false, error: error });
        }
    }
    // Method to create a new user
    static async createUser(req, res) {
        try {
            const {
                username,
                email,
                password,
                firstName,
                lastName,
                phoneNumber
            } = req.body;
            if (!username || !email || !password || !firstName || !lastName || !phoneNumber) {
                res.status(400).json({ success: false, error: 'Missing required fields' });
                return;
            }
            // Check if email or username already exists in database
            const emailexist = await User.find({ email: email });
            const usernameexist = await User.find({ username: username });
            if (emailexist.length > 0) {
                res.status(400).json({ success: false, error: 'Email already exists' });
                return;
            }
            if (usernameexist.length > 0) {
                res.status(400).json({ success: false, error: 'Username already exists' });
                return;
            }
            const newUser = new User({
                username,
                firstName,
                lastName,
                password,
                email,
                phoneNumber
            });
            await newUser.save();
            console.log(username + ' created');
            const userId = newUser._id.toString();
            const id = uuidv4().toString();

            const token = await Auth.generateToken({ id: id, email: newUser.email });
            redisClient.set(`auth_${userId}`, token, 86400);
            Cart.onCreation(userId);
            console.log('Cart created');
            res.status(201).json({ success: true, createdAt: newUser.createdAt, token: token });

        } catch (err) {
            res.status(500).json({ success: false, message: 'server error', error: err });
        }
    }

    // Method to get a user by ID
    static async getUserById(req, res) {
        try {
            const userId = req.session.User.id;
            const user = await User.findById(userId);

            res.status(200).json({ success: true, data: user });
        } catch (error) {
            res.status(500).json({ success: false, error: error });
        }
    }

    // Method to update a user by ID
    static async updateUserById(req, res) {
        try {
            const userId = req.session.User.id;
            const updatedUserData = req.body;

            // Check if user exists in database
            const userInDB = await User.findById(userId);
            if (!userInDB) {
                res.status(404).json({ success: false, error: 'User not found' });
                return;
            }
            // Update user in database
            const { firstName, lastName, phoneNumber } = updatedUserData;
            if (firstName) {
                userInDB.firstName = firstName;
            }
            if (lastName) {
                userInDB.lastName = lastName;
            }
            if (phoneNumber) {
                userInDB.phoneNumber = phoneNumber;
            }
            await userInDB.save();
            res.status(200).json({ success: true, message: 'User updated successfully' });
        } catch (error) {
            res.status(500).json({ success: false, error: error });
        }
    }

    // Method to delete a user by ID
    static async deleteAccount(req, res) {
        try {
            const userId = req.session.User.id;
            await User.findByIdAndDelete(userId);

            // Return success response
            res.status(200).json({ success: true, message: 'User deleted successfully' });
        } catch (error) {
            res.status(500).json({ success: false, error: error });
        }
    }
    static async getCart(req, res) {
        const userId = req.session.User.id;
        const cart = await Cart.findOne({ userId: userId });
        res.status(200).json({ success: true, data: cart });
    }
    static async updateCart(req, res) {
        const userId = req.session.User.id;
        const items = req.params.items;
        await Cart.updateCart(userId, items);
        res.status(200).json({ success: true, message: 'Items added to cart successfully' });
    }
    static async resetPassword(req, res) {
        try {
            const userId = req.session.User.id;
            const { password } = req.body;
            const userInDB = await User.findById(userId);
            if (!userInDB) {
                res.status(404).json({ success: false, error: 'Password not updated' });
                return;
            }
            userInDB.password = password;
            await userInDB.save();
            res.status(200).json({ success: true, message: 'Password updated successfully' });
        } catch (error) {
            res.status(500).json({ success: false, error: error });
        }
    }
}
export default UserController;