import redisClient from '../utils/redis';
import dbClient from '../utils/db';
import { ObjectId } from 'mongodb';

const cart = new dbClient.con.Schema({
    userId: {
        type: String,
        required: true
    },
    items: {
        type: Array
    }
});
class Cart {
    constructor(userId) {
        this.userId = userId;
    }
    static async onLoggin(userId) {
        try {
            const existingCart = await dbClient.con.model('carts', cart).findOne({ userId: ObjectId(userId) });
            if (existingCart) {
                if(existingCart.items.length > 0){
                    redisClient.set(`cart_${userId}`, JSON.stringify(existingCart.items), 3600);
                    return existingCart.items;
                }
                return existingCart.items;
            } else {
                return [];
            }
        } catch (err) {
            console.error(err);
            return null;
        }
    }

    static async onCreation(userId) {
        try{
            await dbClient.con.model('carts', cart).create({ userId: ObjectId(userId), items: [] });
            await redisClient.set(`cart_${userId}`, JSON.stringify([]), 3600);
        }catch(err){
            console.error(err);
        }
    }
    static async onExit(userId) {
        try{
            const existingCart = await redisClient.get(`cart_${userId}`);
            if(existingCart){
                await dbClient.con.model('carts', cart).updateOne({ userId: ObjectId(userId)}, { items: JSON.parse(existingCart) });
            }
            await redisClient.del(`cart_${userId}`);
        }catch(err){
            console.error(err);
        }
    }
}
const CartModel = dbClient.con.model('carts', cart);
CartModel.on('index', function (err) {
    if (err) console.error(err);
});
cart.post('save', async function (doc) {
    try {
        Cart.onCreation(ObjectId(doc.userId));
    } catch (err) {
        console.error(err);
    }
});
export { CartModel, Cart };
