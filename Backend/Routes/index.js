const express = require("express");
const router = express.Router();
const Blog = require("../Models/blogs");
const wrapAsync = require("../Utils/wrapAsync");
const { isUserLoggedIn } = require("../middleware");
const contactController = require("../Controllers/contact");

// Render Home Page
router.get("/", async (req, res) => {
  const meta = {
    title: "Beyond Man",
    description:
      "Read the blogs of different tech stacks like Programming Languages, Website Development, Android Development, and Software Development.",
    keywords:
      "programming, web development, android development, software development, technology",
  };

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 8;

  try {
    const blogs = await Blog.find()
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ created_date: -1 }); // newest first
    const totalBlogs = await Blog.countDocuments();
    const totalPages = Math.ceil(totalBlogs / limit);

    const blog = {};
    if (req.session.user) {
      res.render("index.ejs", {
        blog,
        user: req.session.user,
        allBlogs: blogs,
        meta,
        totalPages,
        limit,
        currentPage: page,
      });
    } else {
      res.render("index.ejs", {
        blog,
        user: null,
        allBlogs: blogs,
        meta,
        totalPages,
        limit,
        currentPage: page,
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// Render About Page
router.get("/about", (req, res) => {
  const meta = {
    title: "Beyond Man | About Us",
  };
  const blog = {};
  res.render("about", { user: req.session.user, meta, blog });
});
router.get("/contact", (req, res) => {
  const meta = {
    title: "Beyond Man | Contact Us",
  };
  const blog = {};
  res.render("contact", { user: req.session.user, meta, blog });
});

router
  .route("/contact")
  .get(contactController.contactPage)
  .post(isUserLoggedIn, wrapAsync(contactController.submitQueryForm));

router.get("/privacy-policy", (req, res) => {
  const meta = {
    title: "Beyond Man | Privacy Policy",
  };
  res.render("privacy_policy", { user: req.session.user, meta });
});
router.get("/terms-and-conditions", (req, res) => {
  const meta = {
    title: "Beyond Man | Terms and Conditions",
  };
  res.render("terms_and_conditions", { user: req.session.user, meta });
});

module.exports = router;
