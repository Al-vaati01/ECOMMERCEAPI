import dotenv from 'dotenv';

dotenv.config();

class Auth {
    //check is user session is active
    static isUser(req, res, next) {
        if (req.session.user) {
            //check if user has id
            if (req.session.user.id) next();
            res.status(401).json({ status: 'error', message: 'Unauthorized' });
        } else {
            res.status(401).json({ status: 'error', message: 'Unauthorized' });
        }
    }
    //check if user is admin
    static isAdmin(req, res, next) {
        if (req.session.user && req.session.user.isAdmin === true) {
            next();
        } else {
            res.status(401).json({ status: 'error', message: 'Unauthorized' });
        }
    }
}
export default Auth;

// import jwt from 'jsonwebtoken';
// import dotenv from 'dotenv';

// dotenv.config();

// class Auth {
//     constructor() {
//         this.secret = process.env.JWT_SECRET;
//     }

//     generateToken(payload) {
//         const token = jwt.sign(payload, this.secret, {expiresIn: '1h'});
//         return token;
//     }

//     verifyToken(token) {
//         try {
//             const decoded = jwt.verify(token, this.secret);
//             return decoded;
//         } catch (error) {
//             return false;
//         }
//     }
// }
// export default Auth;