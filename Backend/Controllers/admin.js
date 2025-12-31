const Blog = require("../Models/Blog");
const Admin = require("../Models/Admin");
const cloudinary = require("cloudinary").v2;
const DOMPurify = require("dompurify");
const { JSDOM } = require("jsdom");

// Initialize DOMPurify
const { window } = new JSDOM("");
const domPurify = DOMPurify(window);

module.exports.home = (req, res) => {
  res.render("../Admin/home.ejs");
};

module.exports.show_profile_page = (req, res) => {
  res.render("../Admin/profile.ejs");
};

module.exports.profile_complete = async (req, res) => {
  try {
    const admin = req.user;

    const url = req.file?.path;
    const filename = req.file?.filename;

    let {
      education,
      location,
      hobbies,
      instagram_profile,
      linkedin_profile,
      x_profile,
      about_admin,
    } = req.body;

    // Validate required fields
    if (!location || !about_admin) {
      return res.status(400).json({
        success: false,
        message: "Location and About Admin are required.",
      });
    }

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

    // Build education objects
    const formattedEducation = education.map((e) => ({
      degreeName: e.degreeName,
      universityName: e.universityName,
      startingDate: e.startingDate,
      endingDate: e.endingDate || null,
    }));

    admin.profile = {
      about_admin,
      location,
      hobbies: hobbiesArray,
      instagram_profile,
      linkedin_profile,
      x_profile,
      profile_image: url ? { url, filename } : admin.profile?.profile_image,
      education: formattedEducation,
    };

    admin.profileCompleted = true;

    await admin.save();
    res.redirect("/admin/dashboard");
  } catch (error) {
    console.error("Admin profile creation error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports.profile_update_page = async (req, res) => {
  const { id } = req.user;
  const admin = await Admin.findById(id);

  res.render("../Admin/profile_update.ejs", { admin });
};
module.exports.profile_update = async (req, res) => {
  try {
    const { id } = req.user;
    const admin = await Admin.findById(id);

    const {
      education,
      location,
      hobbies,
      instagram_profile,
      linkedin_profile,
      x_profile,
      about_admin,
    } = req.body;

    let updatedImage = admin.profile.profile_image;
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
    admin.profile.education = educationArray;
    admin.profile.location = location;
    admin.profile.hobbies = processedHobbies;
    admin.profile.instagram_profile = instagram_profile;
    admin.profile.linkedin_profile = linkedin_profile;
    admin.profile.x_profile = x_profile;
    admin.profile.about_admin = about_admin;
    admin.profile.profile_image = updatedImage;

    await admin.save();
    res.redirect("/admin/dashboard");
  } catch (error) {
    console.error("Error updating profile: ", error);
    res.redirect("/admin/profile-edit");
  }
};

module.exports.dashboard = (req, res) => {
  res.render("../Admin/dashboard.ejs");
};

module.exports.upload_form = (req, res) => {
  res.render("../Admin/upload_blog.ejs");
};
module.exports.upload = async (req, res) => {
  try {
    // Extract image details
    const url = req.file.path;
    const filename = req.file.filename;

    const blogAdmin = await Admin.findById(req.user.id);

    // Extract blog details
    const { path, title, description, content, tags } = req.body;

    // Sanitize the content
    const sanitizedContent = domPurify.sanitize(content);

    // Add `first-paragraph` class to the first <p> tag
    // const modifiedContent = sanitizedContent.replace(/<p>(.*?)<\/p>/);

    // Create and save the new blog
    const newBlog = new Blog({
      path,
      title,
      description,
      content: sanitizedContent,
      tags: tags.split(", "),
      author: blogAdmin,
      image: { url, filename },
    });

    await newBlog.save();

    res.redirect("/admin/reads");
  } catch (err) {
    console.error("Error creating blog:", err);
    res.redirect("/admin/upload");
  }
};

module.exports.reads = async (req, res) => {
  try {
    // const admin = await Admin.findById(req.user.id);
    // const adminUsername = admin.username;
    // const blogs = await Blog.find({ admin: adminUsername });

    const admin = await Admin.findById(req.user.id);
    const blogs = await Blog.find({ author: admin._id });
    res.render("../Admin/reads", { blogs });
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while fetching blogs.");
  }
};

module.exports.read = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    // Define the formatDate function
    const formatDate = (dateString) => {
      if (!dateString) return "N/A";
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    };

    // Also pass formatDateTime if needed
    const formatDateTime = (dateString) => {
      if (!dateString) return "N/A";
      const date = new Date(dateString);
      return date.toLocaleString("en-US", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      });
    };

    res.render("../Admin/read", {
      blog,
      formatDate,
      formatDateTime,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};

module.exports.update_form = async (req, res) => {
  let { id } = req.params;
  let blog = await Blog.findById(id);
  if (!blog) {
    req.redirect("/admin/reads");
  }
  res.render("../Admin/update_blog", { blog });
};

module.exports.update = async (req, res) => {
  try {
    const { id } = req.params; // Extract blog ID from the URL parameter
    const { path, title, content, tags } = req.body;

    // Find the blog by its ID
    const blog = await Blog.findById(id);
    if (!blog) {
      return res.redirect("/admin/reads");
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

    // Create Updated Slug
    const slug = title.trim().replace(/\s+/g, " ");
    const updatedSlug = slug
      .replace(/\+\+/g, "pp") // Replace '++' with 'pp'
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "") // Remove special characters except spaces
      .replace(/\s+/g, "-"); // Replace spaces with hyphens

    // Update the blog with the new values
    blog.path = path;
    blog.title = title;
    blog.content = sanitizedContent;
    blog.tags = processedTags;
    blog.image = updatedImage; // Update the image if a new one is provided
    blog.updated_date = Date.now();
    blog.slug = updatedSlug;

    // Save the updated blog
    await blog.save();

    res.redirect("/admin/reads");
  } catch (err) {
    console.error("Error updating blog:", err);
    res.redirect(`/admin/${req.params.id}/update`);
  }
};

module.exports.destroy = async (req, res) => {
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

    res.json({ message: "Blog deleted successfully!" });
  } catch (err) {
    console.error("Error deleting blog:", err);
    res.status(500).json({ error: "Failed to delete blog." });
  }
};
