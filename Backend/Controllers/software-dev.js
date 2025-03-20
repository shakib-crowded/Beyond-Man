const Blog = require("../Models/blogs");

module.exports.search_software_dev = async (req, res, next) => {
  const topic = req.params.topic || "";
  try {
    let allBlogs = await Blog.find({
      $or: [
        { title: { $regex: topic, $options: "i" } },
        { author: { $regex: topic, $options: "i" } },
        { category: { $regex: topic, $options: "i" } },
        { tags: { $regex: topic, $options: "i" } },
      ],
    });
    const identity = topic.replaceAll("-", " ").toUpperCase();

    const blog = {};
    const meta = {
      title: "BeyondMan | Software Development",
    };
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
