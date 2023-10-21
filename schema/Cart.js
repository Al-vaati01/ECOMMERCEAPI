import redisClient from '../utils/redis.js';
import dbClient from '../utils/db.js';
import { Types } from 'mongoose';


const cart = new dbClient.con.Schema({
    userId: {
        type: Types.ObjectId,
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
            const existingCart = await dbClient.con.model('users').findOne({ userId: new Types.ObjectId(userId) });
            if (existingCart) {
                if(existingCart.items.length > 0){
                    redisClient.set(`cart_${userId}`, JSON.stringify(existingCart.items), 3600);
                    return existingCart.items;
                }
                return existingCart.items;
            } else {
                return [0];
            }
        } catch (err) {
            console.error(err);
            return null;
        }
    }

    static async onCreation(userId) {
        try{
            await dbClient.con.model('carts', cart).create({ userId: new Types.ObjectId(userId), items: [] });
            await redisClient.set(`cart_${userId}`, JSON.stringify([]), 3600);
            return true;
        }catch(err){
            console.error(err);
        }
    }
    static async onExit(userId) {
        try{
            if(!userId){
                return;
            }
            const existingCart = await redisClient.get(`cart_${userId}`);
            if(existingCart){
                await dbClient.con.model('carts').updateOne({ userId: new Types.ObjectId(userId)}, { items: JSON.parse(existingCart) });
            }
            redisClient.del(`cart_${userId}`);
            return;
        }catch(err){
            console.error(err);
        }
    }
    static async updateCart(userId, items) {
        try{
            await dbClient.con.model('carts', cart).updateOne({ userId: new Types.ObjectId(userId)}, { items: items });
            await redisClient.set(`cart_${userId}`, JSON.stringify(items), 3600);
        }catch(err){
            console.error(err);
        }
    }
}

cart.post('save', async function (doc) {
    try {
        Cart.onCreation(new Types.ObjectId(doc.userId));
    } catch (err) {
        console.error(err);
    }
});
const CartModel = dbClient.con.model('carts', cart);
CartModel.on('index', function (err) {
    if (err) console.error(err);
});
export { CartModel, Cart };
