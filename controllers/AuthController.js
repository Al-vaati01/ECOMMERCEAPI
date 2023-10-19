import { User } from '../schema/User.js';
import bcrypt from 'bcrypt';
import Auth from '../middleware/auth.js';
import { v4 as uuidv4 } from 'uuid';
import { AccessToken } from '../schema/User.js';
import redisClient from '../utils/redis.js';
import { Cart } from '../schema/Cart.js';
import { Types } from 'mongoose';


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
            const userInDB = await User.findOne({ email: email });
            if (!userInDB) {
                res.status(401).json({ error: 'Unauthorized' });
            } else if (await bcrypt.compare(hashedpassword.toString(), userInDB.password.toString())) {
                const userId = userInDB._id.toString();

                //check if token exists in redis
                const existingToken = await redisClient.get(`auth_${userId}`);
                if (existingToken) {
                    res.status(200).json({ status: 'Logged in', token: existingToken });
                    return;
                }

                const id = uuidv4().toString();

                const newToken = Auth.generateToken({ id: id, email: newUser.email });
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
            const tokkenId = req.body.decoded.id;//token id

            const userInDB = await User.findOne({ email: email });
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

            const newToken = Auth.generateToken({ id: id, email: userInDB.email });
            redisClient.set(`auth_${userId}`, newToken, 86400);
            req.session.User = {
                id: userId,
                email: userInDB.email,
                username: userInDB.username,
            }
            req.session.save();
            res.status(200).json({ status: 'Logged in', token: newToken });

        } else if (req.body.id) {
            const sessionUid = req.body.id;
            const userId = sessionUid.id;

            //check if token exists in redis
            const existingToken = await redisClient.get(`auth_${userId}`);
            if (existingToken) {
                res.status(200).json({ status: 'Logged in', token: existingToken });
                return;
            }
            const userInDB = await User.findById(userId);
            if (!userInDB) {
                req.session.destroy();
                res.status(401).json({ error: 'Unauthorized' });
            }
            const id = uuidv4().toString();

            const newToken = Auth.generateToken({ id: id, email: newUser.email });
            redisClient.set(`auth_${userId}`, newToken, 86400);
            req.session.User = {
                id: userId,
                email: userInDB.email,
                username: userInDB.username,
            }
        }
    }

    static async disconnect(req, res) {
        try {
            if (req.body.decoded) {
                const id = req.body.decoded.id;
                const email = req.body.decoded.email;
                const user = await User.findOne({ email: email });
                const userId = new Types.ObjectId(user._id);
                await Cart.onExit(userId.toString());
                const t = AccessToken.create({ userId :userId, token: id });
                redisClient.del(`auth_${userId}`);
                req.session.destroy();
                return res.status(204).json({ status: 'Logged out', t});
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