import session from "express-session";
import redisClient from "../utils/redis.js";
import RedisStore from "connect-redis";
import dotenv from "dotenv";

dotenv.config();
redisClient.client.on("error", (err) => {
    console.log("Redis error: ", err);
});

const sessionStore = new RedisStore({
    client: redisClient.client,
    ttl: 86400,
    prefix: "session:",
});

const sessionConfig = session({
    store: sessionStore,
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 86400,
    },
});
export {sessionConfig, sessionStore};