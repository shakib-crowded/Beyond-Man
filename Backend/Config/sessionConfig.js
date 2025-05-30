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
  name: "connect.sid",
  secret: process.env.SECRET_KEY,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  },
};

module.exports = session(sessionOptions);
