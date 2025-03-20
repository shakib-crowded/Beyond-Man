const Blog = require("../Models/blogs");
const Admin = require("../Models/signUpAdmin");

module.exports.searchAll = async (req, res) => {
  let identity = req.query.search || ""; // Handle undefined query
  try {
    let allBlogs = await Blog.find({
      $or: [
        { title: { $regex: identity, $options: "i" } },
        { author: { $regex: identity, $options: "i" } },
        { category: { $regex: identity, $options: "i" } },
        { tags: { $regex: identity, $options: "i" } },
      ],
    });

    const meta = {};
    res.render("searchResults.ejs", {
      allBlogs,
      user: req.session.user,
      identity,
      meta,
    });
  } catch (error) {
    console.error("Error during search:", error);
    res.status(500).send("Internal Server Error");
  }
};
module.exports.searchSpecific = async (req, res) => {
  const { slug } = req.params;
  try {
    const blog = await Blog.findOne({ slug })
      .populate({
        path: "comments",
        populate: { path: "replies" },
      })
      .lean();
    const adminUsername = blog.admin;
    const admin = await Admin.adminSignUp.findOne({ username: adminUsername });

    if (!blog) {
      return res.status(404).send("Blog not found");
    }

    const meta = {};
    res.render("singleBlog.ejs", {
      blog,
      admin,
      user: req.user,
      comments: blog.comments,
      meta,
    });
  } catch (error) {
    console.error(error);
    req.flash(`Error : ---${error}---`);
  }
};
