const Blog = require("../Models/blogs");

module.exports.search_android_dev = async (req, res, nex) => {
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

    const meta = {
      title: "BeyondMan | Android Development",
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
