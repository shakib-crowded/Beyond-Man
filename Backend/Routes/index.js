const express = require("express");
const router = express.Router();
const Blog = require("../Models/blogs");
const wrapAsync = require("../Utils/wrapAsync");
const { isUserLoggedIn } = require("../middleware");
const contactController = require("../Controllers/contact");

// Render Home Page
router.get("/", async (req, res) => {
  const allBlogs = await Blog.find({});

  const meta = {
    title: "Beyond Man",
    description:
      "Read the blogs of different tech stacks like Programming Languages, Website Development, Android Development, and Software Development.",
    keywords:
      "programming, web development, android development, software development, technology",
  };
  const blog = {};
  if (req.session.user) {
    res.render("index.ejs", { blog, user: req.session.user, allBlogs, meta });
  } else {
    res.render("index.ejs", { blog, user: null, allBlogs, meta });
  }
});

// Render About Page
router.get("/about", (req, res) => {
  const meta = {};
  const blog = {};
  res.render("about", { user: req.session.user, meta, blog });
});
router.get("/contact", (req, res) => {
  const meta = {};
  const blog = {};
  res.render("contact", { user: req.session.user, meta, blog });
});

router
  .route("/contact")
  .get(contactController.contactPage)
  .post(isUserLoggedIn, wrapAsync(contactController.submitQueryForm));

router.get("/privacy-policy", (req, res) => {
  res.render("privacy_policy", { user: req.session.user });
});

module.exports = router;
