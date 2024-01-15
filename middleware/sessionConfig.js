import session from "express-session";
// import redisClient from "../utils/redis.js";
// import RedisStore from "connect-redis";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";
import MongoDBStore from 'connect-mongodb-session';
import dbClient from "../utils/db";

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
const MongoDBStoreOptions = {
    uri: dbClient.url,
    collection: 'sessions',
};

const mongoDBStore = new MongoDBStore(MongoDBStoreOptions);

mongoDBStore.on('error', (error) => {
    console.error('MongoDB session store error:', error);
});
const sessionConfig = session({
    name: "ecom",
    // store: sessionStore,
    store: mongoDBStore,
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