const Blog = require("../Models/blogs");

const sanitizeInput = (input) => {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .replace(/\s+/g, " ");
};

module.exports.search_web_dev = async (req, res) => {
  const rawTopic = req.params.topic || "";
  const topic = sanitizeInput(rawTopic.replace(/-/g, " ")); // Replace dashes with spaces and sanitize

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  try {
    const regex = new RegExp(topic, "i"); // Case-insensitive matching

    const searchQuery = {
      $or: [
        { title: regex },
        { author: regex },
        { category: regex },
        { tags: regex },
      ],
    };

    const totalBlogs = await Blog.countDocuments(searchQuery);

    const allBlogs = await Blog.find(searchQuery)
      .sort({ created_date: -1 })
      .skip(skip)
      .limit(limit);

    const totalPages = Math.ceil(totalBlogs / limit);
    const currentPage = page;
    const identity = rawTopic.replace(/-/g, " ").toUpperCase(); // for display in EJS

    const meta = {
      title: `Results for "${identity}"`,
      description: `All blogs related to "${identity}"`,
    };

    const blog = {}; // You can fill this if needed

    res.render("searchResults.ejs", {
      allBlogs,
      user: req.session.user,
      identity,
      meta,
      blog,
      currentPage,
      totalPages,
      limit,
    });
  } catch (error) {
    console.error("Error during search:", error);
    res.status(500).send("Internal Server Error");
  }
};
