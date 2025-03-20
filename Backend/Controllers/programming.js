const Blog = require("../Models/blogs");

module.exports.search_programming = async (req, res, next) => {
  const topic = req.params.topic || "";
  const inCategory = req.baseUrl.replace("/", "") || "";
  try {
    let allBlogs = await Blog.find({
      $or: [
        { title: { $regex: topic, $options: "i" } },
        { author: { $regex: topic, $options: "i" } },
        { category: { $regex: inCategory, $options: "i" } },
        { tags: { $regex: inCategory, $options: "i" } },
      ],
    });
    const identity = topic.replaceAll("-", " ").toUpperCase();

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
