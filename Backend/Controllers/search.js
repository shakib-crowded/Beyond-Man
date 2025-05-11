const Blog = require("../Models/blogs");
const Admin = require("../Models/signUpAdmin");

const sanitizeInput = (input) => {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .replace(/\s+/g, " ");
};

module.exports.searchAll = async (req, res) => {
  let identity = req.query.search || "";
  identity = sanitizeInput(identity);

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 4;
  const skip = (page - 1) * limit;

  try {
    let allBlogs = [];
    let totalBlogs = 0;

    if (identity) {
      // First: Full-text search
      const textQuery = { $text: { $search: identity } };

      totalBlogs = await Blog.countDocuments(textQuery);

      if (totalBlogs > 0) {
        allBlogs = await Blog.find(textQuery, { score: { $meta: "textScore" } })
          .sort({ score: { $meta: "textScore" }, created_date: -1 })
          .skip(skip)
          .limit(limit);
      } else {
        // Fallback: Regex
        const regex = new RegExp(identity, "i");
        const regexQuery = {
          $or: [
            { title: regex },
            { author: regex },
            { category: regex },
            { tags: regex },
          ],
        };

        totalBlogs = await Blog.countDocuments(regexQuery);

        allBlogs = await Blog.find(regexQuery)
          .sort({ created_date: -1 })
          .skip(skip)
          .limit(limit);
      }
    } else {
      // No search term: fetch latest blogs
      totalBlogs = await Blog.countDocuments();
      allBlogs = await Blog.find({})
        .sort({ created_date: -1 })
        .skip(skip)
        .limit(limit);
    }

    const totalPages = Math.ceil(totalBlogs / limit);
    const currentPage = page;

    const meta = {
      title: identity ? `Search results for "${identity}"` : "Latest Blogs",
      description: `Page ${currentPage} of blog search results.`,
    };

    res.render("searchResults.ejs", {
      blog: {},
      allBlogs,
      user: req.session.user,
      identity,
      meta,
      currentPage,
      totalPages,
      limit,
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
