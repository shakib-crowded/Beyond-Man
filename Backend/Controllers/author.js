const Admin = require("../Models/signUpAdmin");
const Blogs = require("../Models/blogs");
const AuthorProfile = require("../Models/authorProfile");

module.exports.authorProfile = async (req, res) => {
  const authorUsername = req.params.username;
  const author = await Admin.adminSignUp.findOne({ username: authorUsername });
  const authorProfile = await AuthorProfile.findOne({
    username: authorUsername,
  });

  const blog = {};
  const allBlogs = await Blogs.find();
  const meta = {
    title: "Beyond Man | Author Profile",
  };

  res.render("authorProfile", {
    author,
    authorProfile,
    meta,
    blog,
    allBlogs,
    user: req.user,
  });
};
