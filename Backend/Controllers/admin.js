const Blog = require("../Models/blogs");
const Admin = require("../Models/signUpAdmin");
const AuthorProfile = require("../Models/authorProfile");
const cloudinary = require("cloudinary").v2;
const DOMPurify = require("dompurify");
const { JSDOM } = require("jsdom");

// Initialize DOMPurify
const { window } = new JSDOM("");
const domPurify = DOMPurify(window);

module.exports.admin_block = (req, res) => {
  if (req.isAuthenticated()) {
    if (req.user.role === "admin") {
      res.redirect("/admin/dashboard");
    } else {
      res.status(403).send("Access Denied :You are not an admin");
    }
  } else {
    res.render("../Admin/admin.ejs");
  }
};

module.exports.admin_dashboard = (req, res) => {
  res.render("../Admin/adminDashboard.ejs");
};

module.exports.admin_edit = (req, res) => {
  res.render("../Admin/upload_blog.ejs");
};
module.exports.admin_upload = async (req, res) => {
  try {
    // Extract image details
    const url = req.file.path;
    const filename = req.file.filename;
    const admin = await Admin.adminSignUp.findById(req.user._id);
    const adminUsername = admin.username;

    // Extract blog details
    const { title, description, content, author, category, tags } = req.body;

    // Sanitize the content
    const sanitizedContent = domPurify.sanitize(content);

    // Add `first-paragraph` class to the first <p> tag
    // const modifiedContent = sanitizedContent.replace(/<p>(.*?)<\/p>/);

    // Create and save the new blog
    const newBlog = new Blog({
      title,
      description,
      content: sanitizedContent,
      author,
      category,
      tags: tags.split(", "),
      admin: adminUsername,
      image: { url, filename },
    });

    await newBlog.save();

    req.flash("success", "New Blog Created!");
    res.redirect("/admin/read");
  } catch (err) {
    console.error("Error creating blog:", err);
    req.flash("error", "Failed to create blog. Please try again.");
    res.redirect("/admin/upload");
  }
};

module.exports.admin_read = async (req, res) => {
  try {
    const admin = await Admin.adminSignUp.findById(res.locals.currAdmin._id);
    const adminUsername = admin.username;
    const blogs = await Blog.find({ admin: adminUsername });
    res.render("../Admin/read_blogs", { blogs });
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while fetching blogs.");
  }
};

module.exports.admin_read_single_blog = async (req, res) => {
  let { id } = req.params;
  let blog = await Blog.findById(id);
  if (!blog) {
    req.flash("false", "Blog Doesn't Exists!");
    res.redirect("/admin/read");
  }
  res.render("../Admin/single_blog", { blog });
};

module.exports.admin_profile_page = (req, res) => {
  res.render("../Admin/adminProfile.ejs");
};

module.exports.admin_profile = async (req, res) => {
  try {
    const url = req.file?.path;
    const filename = req.file?.filename;
    const username = req.user.username;

    let {
      education,
      location,
      hobbies,
      instagram_profile,
      linkedin_profile,
      x_profile,
      about_author,
    } = req.body;

    // Ensure education is always an array
    if (!Array.isArray(education)) {
      education = education ? [education] : [];
    }

    // Split hobbies by comma safely
    const hobbiesArray = hobbies
      ? hobbies
          .split(",")
          .map((h) => h.trim())
          .filter((h) => h !== "")
      : [];

    const adminProfile = new AuthorProfile({
      username,
      education,
      location,
      hobbies: hobbiesArray,
      instagram_profile,
      linkedin_profile,
      x_profile,
      about_author,
      profile_image: { url, filename },
      isCompletedProfile: true,
    });

    await adminProfile.save();

    req.flash("success", "Your Profile Completed!");
    res.redirect("/admin/dashboard");
  } catch (error) {
    console.error("Admin profile creation error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports.admin_profile_update_page = async (req, res) => {
  const adminUsername = req.user.username;
  const adminProfile = await AuthorProfile.findOne({ username: adminUsername });
  res.render("../Admin/admin_profile_update.ejs", { profile: adminProfile });
};
module.exports.admin_profile_update = async (req, res) => {
  try {
    const adminUsername = req.user.username;
    const adminProfile = await AuthorProfile.findOne({
      username: adminUsername,
    });

    const {
      education,
      location,
      hobbies,
      instagram_profile,
      linkedin_profile,
      x_profile,
      about_author,
    } = req.body;

    let updatedImage = adminProfile.profile_image;
    const processedHobbies = hobbies ? hobbies.split(/\s*,\s*/) : [];

    // Process new profile image if uploaded
    if (req.file) {
      updatedImage = {
        url: req.file.path,
        filename: req.file.filename,
      };
    }

    // Convert education object from form input to array of structured entries
    const educationArray = [];
    if (education && typeof education === "object") {
      for (let key in education) {
        if (
          education[key].degreeName?.trim() ||
          education[key].universityName?.trim() ||
          education[key].startingDate?.trim()
        ) {
          educationArray.push({
            degreeName: education[key].degreeName || "",
            universityName: education[key].universityName || "",
            startingDate: education[key].startingDate || "",
            endingDate: education[key].endingDate || "",
          });
        }
      }
    }

    // Update profile fields
    adminProfile.education = educationArray;
    adminProfile.location = location;
    adminProfile.hobbies = processedHobbies;
    adminProfile.instagram_profile = instagram_profile;
    adminProfile.linkedin_profile = linkedin_profile;
    adminProfile.x_profile = x_profile;
    adminProfile.about_author = about_author;
    adminProfile.profile_image = updatedImage;

    await adminProfile.save();
    res.redirect("/admin/dashboard");
  } catch (error) {
    console.error("Error updating profile: ", error);
    res.redirect("/admin/profile-edit");
  }
};

module.exports.admin_update_form = async (req, res) => {
  let { id } = req.params;
  let blog = await Blog.findById(id);
  if (!blog) {
    req.flash("false", "Blog Doesn't Exists!");
    req.redirect("/admin/read");
  }
  res.render("../Admin/update_blog", { blog });
};

module.exports.admin_update = async (req, res) => {
  try {
    const { id } = req.params; // Extract blog ID from the URL parameter
    const { title, content, author, category, tags } = req.body;

    // Find the blog by its ID
    const blog = await Blog.findById(id);
    if (!blog) {
      req.flash("error", "Blog not found.");
      return res.redirect("/admin/read");
    }

    // Update image if a new one is uploaded
    let updatedImage = blog.image; // Default to existing image if no new one is uploaded
    if (req.file) {
      updatedImage = {
        url: req.file.path,
        filename: req.file.filename,
      };
    }

    // Sanitize content (remove unwanted scripts & dangerous HTML)
    const sanitizedContent = domPurify.sanitize(content);

    // Process tags properly (handle different spacing cases)
    const processedTags = tags ? tags.split(/\s*,\s*/) : [];

    // Update the blog with the new values
    blog.title = title;
    blog.content = sanitizedContent;
    blog.author = author;
    blog.category = category;
    blog.tags = processedTags;
    blog.image = updatedImage; // Update the image if a new one is provided
    blog.updated_date = Date.now();

    // Save the updated blog
    await blog.save();

    req.flash("success", "Blog updated successfully!");
    res.redirect("/admin/read");
  } catch (err) {
    console.error("Error updating blog:", err);
    req.flash("error", "Failed to update blog. Please try again.");
    res.redirect(`/admin/${req.params.id}/update`);
  }
};

module.exports.admin_destroy = async (req, res) => {
  let { id } = req.params;

  try {
    // Find the blog to get the image details
    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({ error: "Blog not found." });
    }

    // If the blog has an associated image, delete it from Cloudinary
    if (blog.image && blog.image.filename) {
      await cloudinary.uploader.destroy(blog.image.filename);
    }

    // Delete the blog from the database`
    await Blog.findByIdAndDelete(id);

    req.flash("success", "Blog deleted successfully!");
    res.json({ message: "Blog deleted successfully!" });
  } catch (err) {
    console.error("Error deleting blog:", err);
    res.status(500).json({ error: "Failed to delete blog." });
  }
};
