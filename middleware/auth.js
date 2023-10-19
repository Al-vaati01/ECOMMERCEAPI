import jwt, { decode } from 'jsonwebtoken';
import dotenv from 'dotenv';
import { AccessToken } from '../schema/User.js';
import { User } from '../schema/User.js';

dotenv.config();
const secret = process.env.JWT_SECRET;
class Auth {
    static generateToken(payload) {
        const token = jwt.sign(payload, secret, { expiresIn: '24h' });
        return token;
    }

    static verifyToken(req, res, next) {
        try {
            // Get token from header and check if it exists, if not get userdata from body,
            //if not get userdata from session cookie
            const token = req.headers.authorization.split(' ')[1];
            if (!token) {
                const { email, password } = req.body;
                if (!email || !password) {
                    const { id } = req.session.User;
                    if (!id) {
                        return res.status(401).json({
                            status: 'error',
                            message: 'Unauthorized'
                        });
                    }
                    //set user data in req.userData
                    req.body.id = { id: id };
                    next();
                }
                next();
            }
            //verify token
            const decoded = jwt.verify(token, secret);
            //check if token is expired
            if (decoded.exp < Date.now().valueOf() / 1000) {
                try {
                    const user = User.findOne({ email: decoded.email })
                    const userId = user._id;
                    const id = decoded.id;
                    AccessToken.create({ userId: userId, token: id });
                    return res.status(401).json({
                        status: 'error',
                        message: 'Token expired'
                    });
                } catch (err) {
                    return res.status(500).json({ error: err })
                }
            }
            //set user data in req.userData
            req.body.decoded = decoded;
            req.body.token = token;
            next();
        } catch (error) {
            console.log(error);
            return res.status(401).json({
                status: 'error',
                message: 'Invalid token'
            });
        }
    }
}
export default Auth;