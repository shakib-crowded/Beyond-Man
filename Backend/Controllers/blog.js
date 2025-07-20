const Admin = require("../Models/signUpAdmin");
const Blog = require("../Models/blogs");
require("dotenv").config();

module.exports.blogs = async (req, res, next) => {
  const { slug } = req.params;
  try {
    const blog = await Blog.findOne({ slug })
      .populate({
        path: "comments",
        populate: { path: "replies" },
      })
      .lean();

    if (!blog) {
      return next();
    }
    const adminUsername = blog.admin;
    const admin = await Admin.adminSignUp.findOne({ username: adminUsername });

    res.render("singleBlog.ejs", {
      blog,
      admin,
      user: req.user,
      comments: blog.comments,
      meta: {
        title: blog.title,
        description: blog.description,
        url: `${process.env.BASE_URL + "/" + blog.slug}`,
      },
    });
  } catch (error) {
    console.error(error);
    req.flash(`Error : ---${error}---`);
    res.redirect("/"); // Redirect to home or error page
  }
};
