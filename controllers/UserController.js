import { User } from '../schema/User.js';
import { Cart, CartModel } from '../schema/Cart.js';
import Auth from '../middleware/auth.js';
import { v4 as uuidv4 } from 'uuid';
// import redisClient from '../utils/redis.js';
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
            results.users = users;
            return res.status(200).json({ success: true, data: results });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ success: false, message: 'error' });
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
                return res.status(400).json({ success: false, error: 'Missing required fields' });
            }
            // Check if email or username already exists in database
            const emailexist = await User.find({ email: email });
            const usernameexist = await User.find({ username: username });
            if (emailexist.length > 0) {
                return res.status(400).json({ success: false, error: 'Email already exists' });
            }
            if (usernameexist.length > 0) {
                return res.status(400).json({ success: false, error: 'Username already exists' });
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

            const userId = newUser._id.toString();
            const id = uuidv4().toString();

            const token = Auth.generateToken({ id: id, email: newUser.email });

            req.session.User = { id: userId, username: newUser.username, auth: false };
            // redisClient.set(`auth_${userId}`, token, 86400);
            Cart.onCreation(userId);

            return res.status(201).json({ success: true, createdAt: newUser.createdAt, token: token });

        } catch (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: 'server error' });
        }
    }

    // Method to get a user by ID
    static async getUserById(req, res) {
        try {
            const userId = req.session.User ? req.session.User.id : req.body.id || await AuthController.getUserByfromToken(req, res) || null;
            if (!userId) {
                const tokenId = req.body.decoded.id || null;
                if (!tokenId) {
                    return res.status(401).json({ success: false, error: 'Unauthorized' });
                }
                //check if token is in redis
                // const token = await redisClient.get(`auth_${tokenId}`);
                // if (!token) {
                //     return res.status(401).json({ success: false, error: 'Unauthorized' });
                // }
                const email = req.body.decoded.email;
                if (!email) {
                    return res.status(401).json({ success: false, error: 'Unauthorized' });
                }
                const user = await User.findOne({ email: email }, { password: 0, __v: 0 });
                if (!user) {
                    return res.status(404).json({ success: false, error: 'User not found' });
                }

                const cart = CartModel.findOne({ userId: user._id });
                const { __v, ...cartdata } = cart._doc;
                const data = {
                    ...user._doc,
                    cart: cartdata.items
                };
                return res.status(200).json({ success: true, data: data });
            }
            const user = await User.findById(userId, { password: 0, __v: 0 });
            const cart = await CartModel.findOne({ userId: userId });
            const { __v, ...cartdata } = cart._doc;
            const data = {
                ...user._doc,
                cart: cartdata.items
            };
            return res.status(200).json({ success: true, data: data });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ success: false, error: error });
        }
    }

    // Method to update a user by ID
    static async updateUserById(req, res) {
        try {
            const userId = req.session.User ? req.session.User.id : req.body.id || await AuthController.getUserByfromToken(req, res) || null;
            if (userId === null) {
                return res.status(401).json({ success: false, error: 'Unauthorized' });
            }

            // Check if user exists in database
            const userInDB = await User.findById(userId);
            if (!userInDB) {
                return res.status(404).json({ success: false, error: 'User not found' });
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
                    return res.status(400).json({ success: false, error: 'Email already exists' });
                }
                userInDB.email = email;
            }
            await userInDB.save();
            return res.status(200).json({ success: true, message: 'User updated successfully' });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ success: false, error: error });
        }
    }

    // Method to delete a user by ID
    static async deleteAccount(req, res) {
        try {
            const userId = req.session.User.id || req.body.id || await AuthController.getUserByfromToken(req, res) || null;
            await User.findByIdAndDelete(userId);

            // Return success response
            return res.status(200).json({ success: true, message: 'User deleted successfully' });
        } catch (error) {
            return res.status(500).json({ success: false, error: error });
        }
    }
    static async getCart(req, res) {
        const userId =
            req.session?.User?.id ??
            req.body?.id ??
            (await AuthController.getUserByfromToken(req, res)) ??
            null;

        const cart = await CartModel.findOne({ userId: userId });
        return res.status(200).json({ cart });
    }
    static async updateCart(req, res) {
        const userId =
            req.session?.User?.id ??
            req.body?.id ??
            (await AuthController.getUserByfromToken(req, res)) ??
            null;
        const items = req.body.items;

        if (userId) {
            Cart.updateCart(userId, items);

            let total = 0;
            let quantity = 0;

            for (const item of items) {
                total += item.price;
                quantity += 1;
            }

            return res.status(200).json({ success: true, data: { total: total, quantity: quantity } });
        } else {
            return res.status(400).json({ success: false, message: "User ID not found." });
        }
    }

    static async resetPassword(req, res) {
        try {
            const userId = req.session.User.id || req.body.id || await AuthController.getUserByfromToken(req, res) || null;
            const { password } = req.body;
            const userInDB = await User.findById(userId);
            if (!userInDB) {
                return res.status(404).json({ success: false, error: 'Password not updated' });
                return;
            }
            userInDB.password = password;
            await userInDB.save();
            return res.status(200).json({ success: true, message: 'Password updated successfully' });
        } catch (error) {
            return res.status(500).json({ success: false, error: error });
        }
    }
}
export default UserController;