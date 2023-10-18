import { sessionStore } from "../middleware/sessionConfig.js";

sessionStore.get("session:1", (err, session) => {
    if (err) console.log(err);
    console.log(session);
});