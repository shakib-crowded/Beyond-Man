const session = require("express-session");
const MongoStore = require("connect-mongo");
require("dotenv").config();

// Session Store
const store = MongoStore.create({
  mongoUrl: process.env.ATLASDB_URL, // MongoDB Atlas URI
  crypto: {
    secret: process.env.SECRET_KEY, // Encryption Secret Key
  },
  touchAfter: 24 * 3600, // Reduce session writes (updates once per day)
});

// Error Handling
store.on("error", (err) => {
  console.log("ERROR in MONGO SESSION STORE:", err);
});

// Session Configuration
const sessionOptions = {
  store,
  secret: process.env.SECRET_KEY || "Shakib@dev",
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

module.exports = session(sessionOptions);
