const jwt = require("jsonwebtoken");
const sharp = require("sharp");
const rateLimit = require("express-rate-limit");
const Blog = require("./Models/Blog");
const { validateBlogSchema, validateUserQuery } = require("../Backend/schema");
const { ExpressError } = require("./Utils/ExpressError");
const User = require("./Models/User");
const Admin = require("./Models/Admin");

module.exports.userAuth = async (req, res, next) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.USER_SUPER_SECRET);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message:
          err.name === "TokenExpiredError"
            ? "Session expired, please login again"
            : "Invalid token",
      });
    }

    if (!decoded?.userId) {
      return res.status(401).json({
        success: false,
        message: "Invalid token payload",
      });
    }

    const user = await User.findById(decoded.userId).select(
      "_id name username email role"
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User no longer exists",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports.adminAuth = async (req, res, next) => {
  try {
    const token = req.cookies.adminToken;

    if (!token) {
      return res.redirect("/admin/login");
    }

    const decoded = jwt.verify(token, process.env.ADMIN_SUPER_SECRET);

    // Fetch admin from DB
    const admin = await Admin.findById(decoded.adminId);

    if (!admin) {
      return res.redirect("/admin/login");
    }

    req.user = admin; // <-- now available in next routes
    next();
  } catch (err) {
    return res.redirect("/admin/login");
  }
};

module.exports.redirectUserIfAuthenticated = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      // No token, user is not authenticated, proceed to login/register
      req.user = null;
      return next();
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.USER_SUPER_SECRET);
    const user = await User.findById(decoded.userId).select("-password");

    if (user) {
      // User is authenticated, redirect to home
      return res.redirect("/");
    }

    // Token exists but user not found, clear token and proceed
    res.clearCookie("token");
    req.user = null;
    next();
  } catch (error) {
    // Token is invalid or expired, clear it and proceed to login
    res.clearCookie("token");
    req.user = null;
    next();
  }
};

module.exports.redirectAdminIfAuthenticated = async (req, res, next) => {
  try {
    const adminToken = req.cookies.adminToken;

    if (!adminToken) {
      req.user = null;
      return next();
    }
    // Verify token
    const decoded = jwt.verify(adminToken, process.env.ADMIN_SUPER_SECRET);
    const admin = await Admin.findById(decoded.adminId).select("-password");

    if (admin) {
      // Admin is authenticated, redirect to home
      return res.redirect("/admin/dashboard");
    }

    // Token exists but user not found, clear token and proceed
    res.clearCookie("adminToken");
    req.user = null;
    next();
  } catch (error) {
    // Token is invalid or expired, clear it and proceed to login
    res.clearCookie("adminToken");
    req.user = null;
    next();
  }
};

module.exports.requireVerificationSession = async (req, res, next) => {
  try {
    const TempUser = require("./Models/TempUser");

    // Check if verification cookie exists
    const verificationData = req.cookies.pendingVerification;

    if (!verificationData) {
      return res.redirect("/register");
    }

    const { email, timestamp } = JSON.parse(verificationData);

    // Check if verification session has expired (15 minutes)
    const sessionExpiry = 15 * 60 * 1000; // 15 minutes
    if (Date.now() - timestamp > sessionExpiry) {
      res.clearCookie("pendingVerification");
      return res.redirect("/register");
    }

    // Verify temp user still exists
    const tempUser = await TempUser.findOne({ email });

    if (!tempUser) {
      res.clearCookie("pendingVerification");
      return res.redirect("/register");
    }

    // Attach email to request for use in controller
    req.verificationEmail = email;
    next();
  } catch (error) {
    console.error("Verification session check error:", error);
    res.clearCookie("pendingVerification");
    return res.redirect("/register");
  }
};

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
module.exports.isAdminBlogOwner = async (req, res, next) => {
  try {
    let { id } = req.params;
    let blog = await Blog.findById(id);

    if (!blog) return res.status(404).send("Blog not found");

    if (!blog.author.equals(req.user._id)) {
      if (req.xhr || req.headers.accept?.includes("application/json")) {
        // If it's an AJAX request (fetch), send a JSON response
        return res
          .status(403)
          .json({ error: "You don't have permission to delete this blog." });
      }

      return res.redirect("/admin/reads");
    }
    next();
  } catch (error) {
    console.error(error);
    // next(error);
  }
};

module.exports.isProfileComplete = async (req, res, next) => {
  const { profileCompleted } = req.user;
  if (profileCompleted) return next();

  return res.redirect("/admin/profile");
};

module.exports.appendUser = async (req, res, next) => {
  try {
    const token = req.cookies?.token;
    req.user = null;
    if (!token) return next();

    const decoded = jwt.verify(token, process.env.USER_SUPER_SECRET);

    const user = await User.findById(decoded.userId).select(
      "_id name username email role"
    );
    req.user = user || null;

    next();
  } catch (error) {
    req.user = null;
    next();
  }
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
