const {
  generateAccessToken,
  generateRefreshToken,
} = require("../Config/jwtConfig");
const Admin = require("../Models/Admin");
const { isCompleteProfile } = require("../middleware");
const jwt = require("jsonwebtoken");

module.exports.register_form = (req, res) => {
  return res.render("../Admin/register.ejs");
};

// module.exports.register = async (req, res, next) => {
//   return res.render("../Admin/adminSignUp.ejs");
// const { name, username, email, password, about_admin } = req.body;

// // Check for existing username
// const existingAdmin = await adminSignUp.findOne({ username });
// if (existingAdmin) {
//   req.flash("error", "Username already taken.");
//   return res.redirect("/admin/signup");
// }

// // Create a new admin
// const admin = new adminSignUp({
//   name,
//   username,
//   email,
//   password,
//   about_admin,
// });
// await admin.save();
// req.login(admin, (err) => {
//   if (err) return next(err);
//   res.redirect("/admin/dashboard");
// });
// };

module.exports.login_form = (req, res) => {
  res.render("../Admin/login.ejs");
};

module.exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // Find admin by username or email
    const admin = await Admin.findOne({
      $or: [{ username }, { email: username }],
    });

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Verify password
    const isPasswordValid = await admin.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const adminToken = jwt.sign(
      { adminId: admin._id, userRole: admin.role },
      process.env.ADMIN_SUPER_SECRET,
      { expiresIn: "1d" }
    );

    // Set HTTP-only cookie
    res.cookie("adminToken", adminToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });

    let redirectUrl;
    if (admin.profileCompleted) redirectUrl = "/admin/dashboard";
    else redirectUrl = "/admin/profile";

    return res.status(200).json({
      success: true,
      message: "Login successful",
      redirectUrl,
    });
  } catch (err) {
    next(err);
  }
};

module.exports.logout = (req, res, next) => {
  try {
    // Clear the token cookie
    res.clearCookie("adminToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return res.status(200).json({
      success: true,
      message: "Logout successful",
      redirectUrl: "/",
    });
  } catch (err) {
    next(err);
  }
};
