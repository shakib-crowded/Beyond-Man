const Blog = require("./Models/blogs");
const AuthorProfile = require("./Models/authorProfile");
const {
  validateBlogSchema,
  validateAdminLogin,
  validateAdminSignUp,
  validateUserLogin,
  validateUserSignUp,
  validateUserQuery,
} = require("../Backend/schema");
const { ExpressError } = require("./Utils/ExpressError");
const sharp = require("sharp");
const rateLimit = require("express-rate-limit");

// Validate the blog
module.exports.validateBlog = (req, res, next) => {
  const { error } = validateBlogSchema.validate(req.body);
  if (error) {
    const errMsg = error.details.map((el) => el.message).join(", ");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

// Validate the Admin Sign Up
module.exports.validateAdminSignUpPage = (req, res, next) => {
  const { error } = validateAdminSignUp.validate(req.body);
  if (error) {
    const errMsg = error.details.map((el) => el.message).join(", ");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

// Validate the Admin Login
module.exports.validateAdminLoginPage = (req, res, next) => {
  const { error } = validateAdminLogin.validate(req.body);
  if (error) {
    const errMsg = error.details.map((el) => el.message).join(", ");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

// Middleware To Check User Logged In or Not As a Admin.
module.exports.isAdminLoggedIn = (req, res, next) => {
  if (req.isAuthenticated() && req.user.role === "admin") {
    return next(); // Allow admin access
  } else {
    res.status(403).send("Access Denied: Admins only");
  }
};

module.exports.isAdminBlogOwner = async (req, res, next) => {
  try {
    let { id } = req.params;
    let blog = await Blog.findById(id);
    if (blog) {
      if (blog.admin !== res.locals.currAdmin.username) {
        if (req.xhr || req.headers.accept.indexOf("json") > -1) {
          // If it's an AJAX request (fetch), send a JSON response
          return res
            .status(403)
            .json({ error: "You don't have permission to delete this blog." });
        } else {
          // For regular browser requests, redirect with a flash message
          req.flash(
            "error",
            "You don't have permission to configure this blog."
          );
          return res.redirect("/admin/read");
        }
      }
    }
    next();
  } catch (error) {
    console.error(error);
    next();
  }
};

module.exports.isCompleteProfile = async (req, res, next) => {
  const adminUsername = req.user.username;
  const authorProfile = await AuthorProfile.findOne({
    username: adminUsername,
  });
  if (!authorProfile) {
    req.flash("error", "First Complete Your Profile");
    return res.redirect("/admin/profile");
  }
  next();
};

module.exports.isNotCompleteProfile = async (req, res, next) => {
  const adminUsername = req.user.username;
  const authorProfile = await AuthorProfile.findOne({
    username: adminUsername,
  });
  if (!authorProfile) {
    next();
  } else res.redirect("/admin/dashboard");
};

module.exports.validateUploadImage = async (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded." });
  }

  try {
    // Access the file buffer
    const { path, mimetype } = req.file;

    // Validate file type
    const allowedMimeTypes = ["image/png", "image/jpeg"];
    if (!allowedMimeTypes.includes(mimetype)) {
      return res
        .status(400)
        .json({ error: "Invalid file format. Use PNG, JPG, or JPEG." });
    }

    // Download the file for validation
    const response = await fetch(path);
    const buffer = Buffer.from(await response.arrayBuffer());

    // Check image dimensions and size using Sharp
    const metadata = await sharp(buffer).metadata();
    const { width, height } = metadata;

    if (width < 1050 || width > 1080 || height < 600 || height > 620) {
      return res.status(400).json({
        error:
          "Invalid dimensions. Image must be between 1050–1080 x 600-620 pixels.",
      });
    }

    // if (buffer.length > 1 * 1024 * 1024) {
    //   return res.status(400).json({ error: "File size exceeds 1 MB." });
    // }

    next(); // Pass validation
  } catch (err) {
    console.error("Error validating image:", err);
    return res.status(500).json({ error: "Failed to validate image." });
  }
};

// Middleware to validate image dimensions and file size
module.exports.validateUpdateImage = async (req, res, next) => {
  try {
    // If no file is uploaded, skip validation
    if (!req.file) {
      return next();
    }

    const { buffer } = req.file;

    // Validate image dimensions and size using Sharp
    const metadata = await sharp(buffer).metadata();
    const { width, height } = metadata;

    if (width < 1050 || width > 1080 || height < 600 || height > 620) {
      return res.status(400).json({
        error:
          "Invalid dimensions. Image must be between 1000–1280 x 570–860 pixels.",
      });
    }

    // if (buffer.length > 1 * 1024 * 1024) {
    //   return res.status(400).json({ error: "File size exceeds 1 MB." });
    // }

    next(); // Pass validation if file exists and is valid
  } catch (err) {
    console.error("Error validating image:", err);
    return res.status(500).json({ error: "Failed to validate image." });
  }
};

// Validate User Sign Up
module.exports.validateUserSignUpPage = (req, res, next) => {
  // Convert checkbox value to boolean
  req.body.terms = req.body.terms === "true";

  const { error } = validateUserSignUp.validate(req.body);
  if (error) {
    const errMsg = error.details.map((el) => el.message).join(", ");
    req.flash("error", errMsg);
    return res.redirect("/register");
  }
  next();
};
// Validate the User Login
module.exports.validateUserLoginPage = (req, res, next) => {
  const { error } = validateUserLogin.validate(req.body);
  if (error) {
    const errMsg = error.details.map((el) => el.message).join(", ");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

// Check User Is Logged In Or Not.

module.exports.isUserLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.flash("error", "You must be log in as a user.");
    if (req.url === "/contact") return res.redirect("/login");
    return res.status(401).json({ error: "Unauthorized Access" });
  }
  next();
};

module.exports.isUserNotLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    return res.redirect("/");
  }
  next();
};

/* Validate the User Query*/
module.exports.validateUserQuery = (req, res, next) => {
  const { error } = validateUserQuery.validate(req.body);
  if (error) {
    const errMsg = error.details.map((el) => el.message().join(", "));

    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

/* Login Limit*/

module.exports.loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 Minutes
  max: 5,
  message: "Too many login attempts. Please try again after 15 minutes.",
  headers: true, // Send RateLimit headers
});
