const Admin = require("../Models/Admin");
const Blogs = require("../Models/Blog");

module.exports.authorProfile = async (req, res) => {
  const authorUsername = req.params.username;
  const author = await Admin.findOne({ username: authorUsername });

  const blog = {};
  const allBlogs = await Blogs.find();
  const meta = {
    title: "Beyond Man | Author Profile",
  };

  res.render("author_profile", {
    author,
    meta,
    blog,
    allBlogs,
    user: req.user,
  });
};
