const { userSignUp } = require("../Models/signUpUser");
const Blogs = require("../Models/blogs");
const { v4: uuidv4 } = require("uuid");
const { verifyEmail } = require("../Utils/mailer");
require("dotenv").config();

module.exports.sign_up_form = (req, res) => {
  const blog = {};
  const meta = {
    title: "BeyondMan | Sign Up",
  };
  res.render("../User/sign_up.ejs", { user: req.session.user, meta, blog }); // Sign Up Form
};

module.exports.sign_up = async (req, res, next) => {
  try {
    const { name, username, email, password } = req.body;

    // Check for already registered email
    const duplicateEmailUser = await userSignUp.findOne({ email });
    if (duplicateEmailUser) {
      const isVerified = duplicateEmailUser.isVerified;
      if (!isVerified) {
        await userSignUp.deleteMany({ isVerified: false });
        req.flash("error", "Sorry, you can't verify yourself.");
        return res.redirect("/register");
      }
      req.flash("error", "Email is use by another user.");
      return res.redirect("/register");
    }

    // Check for existing username
    const existingUser = await userSignUp.findOne({ username });
    if (existingUser) {
      const isVerified = existingUser.isVerified;
      if (!isVerified) {
        await userSignUp.deleteMany({ isVerified: false });
        req.flash("error", "Sorry, you can't verify yourself.");
        return res.redirect("/register");
      }
      req.flash("error", "Username already taken.");
      return res.redirect("/register");
    }

    const verificationToken = uuidv4();

    const user = new userSignUp({
      name,
      username,
      email,
      password,
      verificationToken,
      isVerified: false,
      terms: true, // Explicitly set to true since validation passed
    });

    await user.save();
    await verifyEmail(email, verificationToken);

    const meta = { title: "Verify Email" };
    const blog = {};
    res.render("../User/email-verify.ejs", {
      meta,
      blog,
      email,
      user: req.user,
    });
  } catch (err) {
    next(err);
  }
};

module.exports.verifyUser = async (req, res) => {
  const { token } = req.params;

  // Find User
  const user = await userSignUp.findOne({ verificationToken: token });
  if (!user) {
    return res.status(400).send("Invalid token");
  }
  // Mark user as verified
  user.isVerified = true;
  user.verificationToken = null;
  await user.save();
  req.flash("success", "You're Successfully Registered.");
  res.redirect("/login");
};

module.exports.login_form = (req, res) => {
  const blog = {};
  const meta = {
    title: "BeyondMan | Login",
  };
  res.render("../User/login.ejs", { user: req.session.user, blog, meta }); // Login Form
};

module.exports.login = async (req, res) => {
  req.session.user = {
    id: req.user._id,
    username: req.user.username,
    role: "user",
  };

  // Read the pendingAction cookie
  const pendingAction = req.cookies.pendingAction
    ? JSON.parse(req.cookies.pendingAction)
    : null;

  if (pendingAction) {
    // Clear the pendingAction cookie
    res.clearCookie("pendingAction");

    const blog = await Blogs.findById(pendingAction.blogId);
    const blogSlug = blog.slug;
    // Redirect to the blog page
    res.redirect(`/${blogSlug}`);
  } else {
    req.flash("success", "Welcome back to BeyondMan");
    res.redirect("/");
  }
};

module.exports.logout = (req, res, next) => {
  // Passport.js logout
  req.logout(function (err) {
    if (err) {
      console.error("Passport logout error:", err);
      return next(err);
    }

    // Clear the session cookie (must match your session config)
    res.clearCookie("connect.sid", {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // should match session config
      sameSite: "strict",
    });

    // Destroy the session
    req.session.destroy((err) => {
      if (err) {
        console.error("Session destruction error:", err);
        return res
          .status(500)
          .json({ success: false, message: "Logout failed" });
      }

      // For API requests
      if (req.xhr || req.headers.accept.indexOf("json") > -1) {
        return res.json({ success: true, redirect: "/" });
      }
      // For normal requests
      return res.redirect("/");
    });
  });
};
