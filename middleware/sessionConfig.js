import session from "express-session";
// import redisClient from "../utils/redis.js";
// import RedisStore from "connect-redis";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";
import connectMongo from 'connect-mongodb-session';


dotenv.config();
const secret_session = process.env.SESSION_SECRET;
if (!secret_session) {
    console.error("No session secret set in .env");
    process.exit(1);
}
// redisClient.client.on("error", (err) => {
//     console.log("Redis error: ", err);
// });

// const sessionStore = new RedisStore({
//     client: redisClient.client,
//     ttl: 86400,
//     prefix: "session:",
// });
const mongoDBStore = new connectMongo(session);

const host = process.env.DB_HOST || 'db';
const port = process.env.DB_PORT || 27018;
const database = 'ecomsessions';

const MongoDBStore = new mongoDBStore({
    uri: `mongodb://${host}:${port}/${database}`,
    collection: 'sessions',
});



MongoDBStore.on('error', (error) => {
    console.error('MongoDB session store error:', error);
});
MongoDBStore.on('connected', () => {
    console.log('MongoDB session store connected');
});
const sessionConfig = session({
    name: "ecom",
    // store: sessionStore,
    store: MongoDBStore,
    secret: secret_session,
    genid: (req) => {
        return uuidv4();
    },
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: process.env.NODE_ENV === 'production' ? true : false,
        httpOnly: true,
        maxAge: 86400,
    },
});
export {sessionConfig};