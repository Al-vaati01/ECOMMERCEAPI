import { User } from '../schema/User.js';
import { Cart, CartModel } from '../schema/Cart.js';
import Auth from '../middleware/auth.js';
import { v4 as uuidv4 } from 'uuid';
import redisClient from '../utils/redis.js';
import AuthController from './AuthController.js';


class UserController {
    // Method to get all users
    static async getAllUsers(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = 20;

            const users = await User.find({}, { password: 0, __v: 0 }).limit(limit).skip((page - 1) * limit);
            const results = {};
            if (users.length < limit) {
                results.next = null;
            } else {
                results.next = {
                    page: page + 1,
                };
            }
            if (page > 1) {
                results.previous = {
                    page: page - 1,
                };
            }
            results.results = users;
            res.status(200).json({ success: true, data: results });
        } catch (error) {
            console.log(error);
            res.status(500).json({ success: false, message: 'error' });
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
            const hashedPassword = await AuthController.hashPassword(password);
            const newUser = new User({
                username,
                firstName,
                lastName,
                password: hashedPassword,
                email,
                phoneNumber
            });
            await newUser.save();
            console.log(username + ' created');
            const userId = newUser._id.toString();
            const id = uuidv4().toString();

            const token = Auth.generateToken({ id: id, email: newUser.email });
            redisClient.set(`auth_${userId}`, token, 86400);
            Cart.onCreation(userId);
            console.log('Cart created');
            res.status(201).json({ success: true, createdAt: newUser.createdAt, token: token });

        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: 'server error' });
        }
    }

    // Method to get a user by ID
    static async getUserById(req, res) {
        try {
            const userId = req.session.User ? req.session.User.id : req.body.id || await AuthController.getUserByfromToken(req, res) || null;
            if (!userId) {
                const tokenId = req.body.decoded.id || null;
                if (!tokenId) {
                    res.status(401).json({ success: false, error: 'Unauthorized' });
                    return;
                }
                //check if token is in redis
                const token = await redisClient.get(`auth_${tokenId}`);
                if (!token) {
                    res.status(401).json({ success: false, error: 'Unauthorized' });
                    return;
                }
                const email = req.body.decoded.email;
                if (!email) {
                    res.status(401).json({ success: false, error: 'Unauthorized' });
                    return;
                }
                const user = await User.findOne({ email: email }, { password: 0, __v: 0 });
                if (!user) {
                    res.status(404).json({ success: false, error: 'User not found' });
                    return;
                }

                const cart = CartModel.findOne({ userId: user._id });
                const { __v, ...cartdata } = cart._doc;
                const data = {
                    ...user._doc,
                    cart: cartdata.items
                };
                res.status(200).json({ success: true, data: data });
            }
            const user = await User.findById(userId, { password: 0, __v: 0 });
            const cart = await CartModel.findOne({ userId: userId });
            const { __v, ...cartdata } = cart._doc;
            const data = {
                ...user._doc,
                cart: cartdata.items
            };
            res.status(200).json({ success: true, data: data });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, error: error });
        }
    }

    // Method to update a user by ID
    static async updateUserById(req, res) {
        try {
            const userId = req.session.User ? req.session.User.id : req.body.id || await AuthController.getUserByfromToken(req, res) || null;
            if (userId === null) {
                res.status(401).json({ success: false, error: 'Unauthorized' });
                return;
            }

            // Check if user exists in database
            const userInDB = await User.findById(userId);
            if (!userInDB) {
                res.status(404).json({ success: false, error: 'User not found' });
                return;
            }
            // Update user in database
            const { firstName, lastName, phoneNumber, password, email } = req.body;
            if (firstName) {
                userInDB.firstName = firstName;
            }
            if (lastName) {
                userInDB.lastName = lastName;
            }
            if (phoneNumber) {
                userInDB.phoneNumber = phoneNumber;
            }
            if (password) {
                const hashedPassword = await AuthController.hashPassword(password);
                userInDB.password = hashedPassword;
            }
            if (email) {
                const emailExist = await User.find({ email: email });
                if (emailExist.length > 0) {
                    res.status(400).json({ success: false, error: 'Email already exists' });
                    return;
                }
                userInDB.email = email;
            }
            await userInDB.save();
            res.status(200).json({ success: true, message: 'User updated successfully' });
        } catch (error) {
            console.log(error);
            res.status(500).json({ success: false, error: error });
        }
    }

    // Method to delete a user by ID
    static async deleteAccount(req, res) {
        try {
            const userId = req.session.User.id || req.body.id || await AuthController.getUserByfromToken(req, res) || null;
            await User.findByIdAndDelete(userId);

            // Return success response
            res.status(200).json({ success: true, message: 'User deleted successfully' });
        } catch (error) {
            res.status(500).json({ success: false, error: error });
        }
    }
    static async getCart(req, res) {
        const userId = req.session.User.id || req.body.id || await AuthController.getUserByfromToken(req, res) || null;
        const cart = await Cart.findOne({ userId: userId });
        res.status(200).json({ cart });
    }
    static async updateCart(req, res) {
        const userId = req.session.User.id || req.body.id || await AuthController.getUserByfromToken(req, res) || null;
        const items = req.params.items;
        await Cart.updateCart(userId, items);
        //calculate total price and quantity
        let total = 0;
        let quantity = 0;
        for (const item of items) {
            total += item.price * item.quantity;
            quantity += item.quantity;
        }
        res.status(200).json({ success: true, data: { total: total, quantity: quantity } });
    }
    static async resetPassword(req, res) {
        try {
            const userId = req.session.User.id || req.body.id || await AuthController.getUserByfromToken(req, res) || null;
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