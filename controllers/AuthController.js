import { User } from '../schema/User.js';
import bcrypt from 'bcrypt';

class AuthController {
    static async connect(req, res) {
        const header = req.headers.authorization;
        if (!header || !header.startsWith('Basic ')) {
            res.status(400).json({ error: 'Bad Request' });
            return;
        }
        const credentials = Buffer.from(header.split('Basic ')[1], 'base64').toString('utf-8');
        const [email, password] = credentials.split(':');
        const hashed_password = this.hashPassword(password);


        // Check if the user exists in the database
        const userInDB = await User.findOne({ email: email });
        if (!userInDB) {
            res.status(401).json({ error: 'Unauthorized' });
        } else if (bcrypt.compare(hashed_password, userInDB.password)) {
            const id = userInDB._id.toString();

            req.session.User = {
                id: id,
                email: userInDB.email
            }
            req.session.save();
            res.status(200).json({status: 'Logged in'});
        } else {
            res.status(401).json({ error: 'Unauthorized' });
        }
    }

    static async disconnect(req, res) {
        try {
                if (req.session.User) {
                    const userId = req.session.User.id;
                    await Cart.onExit(userId);
                    await req.session.destroy();
                    res.status(204).json({ status: 'Logged out' });
                }
                res.status(401).json({ error: 'Unauthorized' });
        } catch (err) {
            console.log(err);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    static async hashPassword(password) {
        const saltRounds = 10;
        const hashed_password = await bcrypt.hash(password, saltRounds);

        return hashed_password;
    }
}

export default AuthController;