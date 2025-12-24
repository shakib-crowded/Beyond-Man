if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}
const express = require("express");
const path = require("path");
const ejsMate = require("ejs-mate");
const methodOverride = require("method-override");
const flash = require("connect-flash");
const cookieParser = require("cookie-parser");
const imageRouter = require("./Routes/imagesRouter.js");
const adminRouter = require("./Routes/admin.js");
const adminEnterRouter = require("./Routes/adminEnter.js");
const userEnterRouter = require("./Routes/userEnter.js");
const indexRouter = require("./Routes/index.js");
const searchRouter = require("./Routes/search.js");
const queryRouter = require("./Routes/query.js");
const adminCourseRouter = require("./Routes/adminCourseRouter.js");
const coursesRouter = require("./Routes/coursesRouter.js");
const pathRouter = require("./Routes/pathRouter.js");
const forgotPasswordRouter = require("./Routes/forgot-password.js");
const resetPasswordRouter = require("./Routes/reset-password.js");
const commentRouter = require("./Routes/comment.js");
const sitemapRouter = require("./Routes/sitemap.js");
const authorRouter = require("./Routes/author.js");
const blogRouter = require("./Routes/blog.js");
const connectDB = require("./DB/db.js");
const { appendUser } = require("./middleware.js");

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
app.use("/", appendUser);

// Routes
app.use("/images", imageRouter);
app.use("/admin", adminRouter, adminEnterRouter, adminCourseRouter);
app.use("/path", pathRouter);
app.use("/author", authorRouter);
app.use("/reset-password", resetPasswordRouter);
app.use("/", indexRouter, userEnterRouter, blogRouter, coursesRouter);
app.use("/comments", commentRouter);
app.use("/query", queryRouter);
app.use("/forgot-password", forgotPasswordRouter);
app.use("/sitemap.xml", sitemapRouter);
app.use((req, res) => {
  res.render("page_not_found");
});

module.exports = app;
