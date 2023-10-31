import { Admin, User } from '../schema/User.js';
import bcrypt from 'bcrypt';
import Auth from '../middleware/auth.js';
import { v4 as uuidv4 } from 'uuid';
import { AccessToken } from '../schema/User.js';
import redisClient from '../utils/redis.js';
import { Cart } from '../schema/Cart.js';
import { Types } from 'mongoose';
import e from 'express';


class AuthController {
    static hashPassword(password) {
        const saltRounds = 10;
        const hashed_password = bcrypt.hash(password.toString(), saltRounds);

        return hashed_password;
    }
    static async connect(req, res) {
        if (req.body.email && req.body.password) {
            const email = req.body.email;
            const password = req.body.password;

            const hashedpassword = AuthController.hashPassword(password);

            // Check if the user exists in the database
            let userInDB = null;
            if (req.body.role) {
                if (req.body.role === 'admin') {
                    userInDB = await Admin.findOne({ email: email });
                }else{
                    res.status(403).json({ success: false, message: 'Forbidden' });
                }
            } else {
                userInDB = await User.findOne({ email: email });
            }

            if (userInDB === null) {
                res.status(401).json({ error: 'Unauthorized' });
            } else if (bcrypt.compare(hashedpassword.toString(), userInDB.password.toString())) {
                const userId = userInDB._id.toString();

                //check if token exists in redis
                const existingToken = await redisClient.get(`auth_${userId}`);
                if (existingToken) {
                    res.status(200).json({ status: 'Logged in', token: existingToken });
                    return;
                }

                const id = uuidv4().toString();

                let newToken;
                if (req.body.role && req.body.role === 'admin') {
                    newToken = Auth.generateToken({ id: id, email: userInDB.email, role: 'admin' });
                } else {
                    newToken = Auth.generateToken({ id: id, email: userInDB.email });
                }
                redisClient.set(`auth_${userId}`, newToken, 86400);
                req.session.User = {
                    id: userId,
                    email: userInDB.email,
                    username: userInDB.username,
                }
                req.session.save();
                res.status(200).json({ status: 'Logged in', token: newToken });
            } else {
                res.status(401).json({ error: 'Unauthorized' });
            }

        } else if (req.body.decoded) {
            const email = req.body.decoded.email;

            let userInDB;
            if (req.body.decoded.role && req.body.decoded.role === 'admin') {
                userInDB = await Admin.findOne({ email: email });
            } else {
                userInDB = await User.findOne({ email: email });
            }
            if (!userInDB) {
                res.status(401).json({ error: 'Unauthorized' });
            }
            const userId = userInDB._id.toString();

            //check if token exists in redis
            const existingToken = await redisClient.get(`auth_${userId}`);
            if (existingToken) {
                //check if id is in expired token list
                const expiredToken = await AccessToken.findOne({ userId: userId });
                if (expiredToken) {
                    redisClient.del(`auth_${userId}`);
                    req.session.destroy();
                    res.status(401).json({ error: 'Unauthorized' });
                    return;
                }
                res.status(200).json({ status: 'Logged in', token: existingToken });
                return;
            }

            const id = uuidv4().toString();

            let newToken;
            if (req.body.decoded.role && req.body.decoded.role === 'admin') {
                newToken = Auth.generateToken({ id: id, email: userInDB.email, role: 'admin' });
            } else {
                newToken = Auth.generateToken({ id: id, email: userInDB.email });
            }
            redisClient.set(`auth_${userId}`, newToken, 86400);
            req.session.User = {
                id: userId,
                email: userInDB.email,
                username: userInDB.username,
            }
            req.session.save();
            res.status(200).json({ status: 'Logged in', token: newToken });

        } else if (req.body.id) {
            const userId = req.body.id;

            //check if token exists in redis
            const existingToken = await redisClient.get(`auth_${userId}`);
            if (existingToken) {
                res.status(200).json({ status: 'Logged in', token: existingToken });
                return;
            }
            let userInDB;
            if (req.body.role && req.body.role === 'admin') {
                userInDB = await Admin.findById(userId);
            } else {
                userInDB = await User.findById(userId);
            }
            if (!userInDB) {
                req.session.destroy();
                res.status(401).json({ error: 'Unauthorized' });
            }
            const id = uuidv4().toString();

            let newToken;
            if (req.body.decoded.role && req.body.decoded.role === 'admin') {
                newToken = Auth.generateToken({ id: id, email: userInDB.email, role: 'admin' });
            } else {
                newToken = Auth.generateToken({ id: id, email: userInDB.email });
            }
            redisClient.set(`auth_${userId}`, newToken, 86400);
            req.session.User = {
                id: userId,
                email: userInDB.email,
                username: userInDB.username,
            }
            req.session.save();
            res.status(200).json({ status: 'Logged in', token: newToken });
        }
    }
    //get user by id using token
    static async getUserByfromToken(req, res) {
        const tokenId = req.body.decoded ? req.body.decoded.id : null;
        if (!tokenId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        //get user id using email
        const email = req.body.decoded.email;
        if (!email) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const user = await User.findOne({ email: email }, { password: 0, __v: 0 });
        if (!user) {
            res.status(404).json({ error: 'Unauthorized' });
            return;
        }
        const userId = user._id.toString();
        //check if token is in redis
        const token = await redisClient.get(`auth_${userId}`);
        if (!token) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        return userId;
    }
    static async getAdminByfromToken(req, res) {
        const tokenId = req.body.decoded ? req.body.decoded.id : null;
        if (!tokenId) {
            return null;
        }
        //get user id using email
        const email = req.body.decoded.email;
        if (!email) {
            return null;
        }
        const admin = await Admin.findOne({ email: email }, { password: 0, __v: 0 });
        if (!admin) {
            return  null;
        }
        const adminId = admin._id.toString();
        //check if token is in redis
        const token = await redisClient.get(`auth_${adminId}`);
        if (!token) {
            return null;
        }
        return adminId;
    }
    static async disconnect(req, res) {
        try {
            if (req.body.decoded) {
                const id = req.body.decoded.id;
                const email = req.body.decoded.email;
                let user, userId;
                if (req.body.decoded.role && req.body.decoded.role === 'admin') {
                    user = await Admin.findOne({ email: email });
                } else {
                    user = await User.findOne({ email: email });
                    userId = new Types.ObjectId(user._id);
                    await Cart.onExit(userId.toString());
                }
                AccessToken.create({ userId: userId, token: id });
                redisClient.del(`auth_${userId}`);
                req.session.destroy();
                return res.status(204).json({ status: 'Logged out' });
            }
            if (req.session.User) {
                const userId = new Types.ObjectId(req.session.User.id);
                await Cart.onExit(userId);
                await req.session.destroy();
                return res.status(204).json({ status: 'Logged out' });
            }
            return res.status(401).json({ error: 'Unauthorized' });
        } catch (err) {
            console.log(err);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }


}

export default AuthController;