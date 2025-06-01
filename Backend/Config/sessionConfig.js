const session = require("express-session");
const MongoStore = require("connect-mongo");
require("dotenv").config();

// Detect environment (true in production)
const isProduction = process.env.NODE_ENV === "production";

// Session Store
const store = MongoStore.create({
  mongoUrl: process.env.ATLASDB_URL,
  crypto: {
    secret: process.env.SECRET_KEY,
  },
  touchAfter: 24 * 3600,
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
    secure: isProduction,
    sameSite: isProduction ? "lax" : "strict", // optional, tighter security in dev
    maxAge: 7 * 24 * 60 * 60 * 1000,
  },
};

module.exports = session(sessionOptions);
