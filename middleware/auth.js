import jwt from 'jsonwebtoken';

const config = {
    jwtSecret: '$2b$08$VmIxTo1nkf4tFtPFMy7KtOWQh2ks6KJzvejWt2W4cbLWuHbExdFu2'
};

function auth(req, res, next) {
    // Get the token from the request header
    const token = req.header('x-auth-token');

    // Check if token exists
    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, config.jwtSecret);

        // Add user from payload to request object
        req.user = decoded.user;

        // Check if user has admin role
        if (req.user.role !== 'admin') {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        next();
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
}

module.exports = auth;
