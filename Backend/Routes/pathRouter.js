const express = require("express");
const router = express.Router();
const Blog = require("../Models/blogs");
const TechPath = require("../Models/techPath");

router.get("/:path", async (req, res) => {
  let path = `/path/${req.params.path}`; // Add the prefix to match database

  const categories = await TechPath.find();
  let languageInfo = null;

  for (const category of categories) {
    const foundIcon = category.techIcons.find((icon) => icon.path === path);
    if (foundIcon) {
      languageInfo = {
        ...foundIcon.toObject(),
        category: category.title,
      };
      break;
    }
  }

  const meta = {
    title: "Beyond Man",
  };
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 8;
  const skip = (page - 1) * limit;

  path = path.split("/")[2];

  try {
    const blogs = await Blog.find({ languageName: path })
      .skip(skip)
      .limit(limit);
    const totalBlogs = await Blog.countDocuments();
    const totalPages = Math.ceil(totalBlogs / limit);

    // Check if the request is AJAX
    if (req.xhr || req.headers.accept.indexOf("json") > -1) {
      return res.json({
        blogs,
        pagination: {
          totalPages,
          currentPage: page,
          limit,
        },
      });
    }

    // Regular page load
    const blog = {};
    res.render("path.ejs", {
      blog,
      user: req.session.user || null,
      allBlogs: blogs,
      meta,
      totalPages,
      limit,
      currentPage: page,
      languageInfo,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
