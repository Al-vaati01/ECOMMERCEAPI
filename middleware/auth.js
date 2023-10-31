import jwt, { decode } from 'jsonwebtoken';
import dotenv from 'dotenv';
import { AccessToken, Admin } from '../schema/User.js';
import { User } from '../schema/User.js';
import AuthController from '../controllers/AuthController.js';


dotenv.config();
const secret = process.env.JWT_SECRET;
class Auth {
    static generateToken(payload) {
        const token = jwt.sign(payload, secret, { expiresIn: '24h' });
        return token;
    }
    static async isAdmin(req, res, next) {
        try {
            if (req.body.id || req.body.decoded || req.body.token) {
                const adminsessId = req.body.id;
                const user = await Admin.findById(adminsessId);
                if (user) {
                    if (user.role !== 'admin') {
                        return res.status(403).json({
                            status: 'error',
                            message: 'Forbidden'
                        });
                    }
                    req.body.role = 'admin';
                    next();
                }
                const adminId = await AuthController.getAdminByfromToken(req, res);
                const admin = await Admin.findById(adminId);
                if (!admin) {
                    res.status(403).json({
                        status: 'error',
                        message: 'Forbidden'
                    });
                }
                if (req.body.decoded.role !== 'admin') {
                    return res.status(403).json({
                        status: 'error',
                        message: 'Forbidden'
                    });
                }
                next();
            }
            if (req.body.email && req.body.password) {
                const email = req.body.email;

                const user = await Admin.findOne({ email: email });
                if (!user) {
                    return res.status(403).json({
                        status: 'error',
                        message: 'Forbidden'
                    });
                }
                if (user.isAdmin !== true) {
                    return res.status(403).json({
                        status: 'error',
                        message: 'Forbidden'
                    });
                }
                req.body.role = 'admin';
                next();
            }

        } catch (error) {
            console.error(error);
            res.status(500).json({
                status: 'error',
                message: 'Server error'
            });
        }
    }

    static async verifyToken(req, res, next) {
        try {
            // Get token from header and check if it exists, if not get userdata from body,
            // if not get userdata from session cookie
            const token = req.headers.authorization ? req.headers.authorization.split(' ')[1] : null;
            if (!token) {
                const { email, password } = req.body;
                if (email && password) {
                    return next();
                }

                const id = req.session.User ? req.session.User.id : null;
                if (!id) {
                    return res.status(401).json({
                        status: 'error',
                        message: 'Unauthorized'
                    });
                }

                req.body.id = { id: id };
                return next();
            }

            // verify token
            const decoded = jwt.verify(token, secret);
            // check if token is expired
            if (decoded.exp < Date.now() / 1000) {
                const user = await User.findOne({ email: decoded.email });
                if (!user) {
                    return res.status(401).json({
                        status: 'error',
                        message: 'Unauthorized'
                    });
                }
                const userId = user._id;
                const id = decoded.id;
                await AccessToken.create({ userId: userId, token: id });
                return res.status(401).json({
                    status: 'error',
                    message: 'Token expired'
                });
            }
            // set user data in req.userData
            req.body.decoded = decoded;
            req.body.token = token;
            return next();
        } catch (error) {
            console.error(error);
            return res.status(401).json({
                status: 'error',
                message: 'Invalid token'
            });
        }
    }

}
export default Auth;