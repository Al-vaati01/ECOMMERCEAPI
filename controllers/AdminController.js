import { Admin, User } from "../schema/User.js";
import AuthController from "./AuthController.js";
import UserController from "./UserController.js";

class AdminController {
    static async createUser(req, res) {
        try {
            const {
                username,
                firstName,
                lastName,
                password,
                email,
                phoneNumber
            } = req.body;
            if (!username || !email || !password || !firstName || !lastName || !phoneNumber) {
                res.status(400).json({ success: false, error: 'Missing required fields' });
                return;
            }
            // Check if email or username already exists in database
            const emailExist = await Admin.find({ email: email });
            const userNameExist = await Admin.find({ username: username });
            if (emailExist.length > 0) {
                res.status(400).json({ success: false, error: 'Email already exists' });
                return;
            }
            if (userNameExist.length > 0) {
                res.status(400).json({ success: false, error: 'Username already exists' });
                return;
            }
            const hashedPassword = await AuthController.hashPassword(password);
            const newAdmin = new Admin({
                username,
                firstName,
                lastName,
                password: hashedPassword,
                email,
                phoneNumber
            });
            await newAdmin.save();

            const adminId = newAdmin._id.toString();
            const id = uuidv4().toString();

            const token = Auth.generateToken({ id: id, email: newAdmin.email ,role: 'admin'});
            redisClient.set(`auth_${adminId}`, token, 86400);
            res.status(201).json({ success: true, createdAt: newAdmin.createdAt, token: token });

        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: 'server error' });
        }
    }
    static async getAllUsers(req, res) {
        return UserController.getAllUsers(req, res);
    }
    static async deleteUser(req, res) {
        //take user id from params
        const userId = req.params.id;
        //delete user from db
        const user = await User.findByIdAndDelete(userId);
        if (!user) {
            res.status(404).json({ success: false, message: 'User not found' });
            return;
        }
        //delete user from redis
        redisClient.del(`auth_${userId}`);
        //delete user cart from redis
        redisClient.del(`cart_${userId}`);
        res.status(200).json({ success: true, message: 'User deleted successfully' });
    }
    static async getUser(){
        const userId = req.params.id;
        req.body.id = userId;
        return UserController.getUser(req,_);
    }
    static async updateUser(req, res) {
        const userId = req.params.id;
        req.body.id = userId;
        return UserController.updateUser(req, res);
    }

}
export default AdminController;