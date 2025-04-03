const Blog = require("../Models/blogs");

module.exports.search_programming = async (req, res, next) => {
  const category = req.params.topic || "";
  try {
    let allBlogs = await Blog.find({
      $or: [
        { title: { $regex: category, $options: "i" } },
        { author: { $regex: category, $options: "i" } },
        { category: { $regex: category, $options: "i" } },
        { tags: { $regex: category, $options: "i" } },
      ],
    }).sort({ created_date: -1 });
    const identity = category.replaceAll("-", " ").toUpperCase();

    const meta = {
      title: "BeyondMan | Programming",
    };
    const blog = {};
    res.render("searchResults.ejs", {
      allBlogs,
      user: req.session.user,
      identity,
      meta,
      blog,
    });
  } catch (error) {
    console.error("Error during search:", error);
    res.status(500).send("Internal Server Error");
  }
};
