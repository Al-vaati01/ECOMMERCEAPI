import mongoose from "mongoose";
import dotenv from 'dotenv';

dotenv.config();

const host = process.env.DB_HOST || 'localhost';
const port = process.env.DB_PORT || 27017;
const database = process.env.DB_DATABASE || console.error('Database env variable not set');

class DbClient {
    constructor() {
        const url = `mongodb://${host}:${port}/${database}`;
        this.alive = this.connectDb(url);
    }
    connectDb(url) {
        try {
            mongoose.connect(url, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            });

            if (mongoose.connection.readyState === 0) {
                mongoose.connection.on('error', console.error.bind(console, 'connection error:'))
                return false;
            }else {
                console.log('Connected to DB');
                this.con = mongoose;
                return true;
            }
        } catch (error) {
            console.error('Error connecting to DB', error);
            return false
        }
    }

    isAlive() {
        return this.alive;
    }
}
const dbClient = new DbClient();
export default dbClient;
