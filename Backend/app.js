if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}
const express = require("express");
const path = require("path");
const ejsMate = require("ejs-mate");
const methodOverride = require("method-override");
const flash = require("connect-flash");
const passport = require("./Config/passportConfig.js");
const cookieParser = require("cookie-parser");
const sessionMiddleware = require("./Config/sessionConfig.js");
const adminRouter = require("./Routes/admin.js");
const adminEnterRouter = require("./Routes/adminEnter.js");
const userEnterRouter = require("./Routes/userEnter.js");
const indexRouter = require("./Routes/index.js");
const searchRouter = require("./Routes/search.js");
const programmingRouter = require("./Routes/programming.js");
const webDevRouter = require("./Routes/web-dev.js");
const androidDevRouter = require("./Routes/android-dev.js");
const softwareDevRouter = require("./Routes/software-dev.js");
const queryRouter = require("./Routes/query.js");
const forgotPassword = require("./Routes/forgot-password.js");
const resetPassword = require("./Routes/reset-password.js");
const commentRouter = require("./Routes/comment.js");
const sitemap = require("./Routes/sitemap.js");
// const authorRouter = require("./Routes/author.js");
const blogRouter = require("./Routes/blog.js");
const connectDB = require("./DB/db.js");

// Initialize app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // Parses JSON bodies
app.use(cookieParser());

app.set("views", path.join(__dirname, "../Frontend/Views/Blogging"));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "../Frontend/Public")));
app.engine("ejs", ejsMate);
app.use(methodOverride("_method"));
app.use(sessionMiddleware);
app.use(flash());

// Passport Configuration
app.use(passport.initialize());
app.use(passport.session());

// Flash Messages Middleware
app.use((req, res, next) => {
  res.locals.messages = req.flash();
  res.locals.currAdmin = req.user;
  next();
});

// Routes
app.use("/search", searchRouter);
app.use("/", indexRouter, userEnterRouter, blogRouter);
app.use("/query", queryRouter);
app.use("/programming", programmingRouter);
app.use("/website-dev", webDevRouter);
app.use("/android-dev", androidDevRouter);
app.use("/software-dev", softwareDevRouter);
app.use("/admin", adminRouter, adminEnterRouter);
app.use("/forgot-password", forgotPassword);
app.use("/reset-password", resetPassword);
app.use("/comments", commentRouter);
app.use("/sitemap.xml", sitemap);
// app.use("/author", authorRouter);

app.use((req, res) => {
  res.render("page_not_found");
});

module.exports = app;
