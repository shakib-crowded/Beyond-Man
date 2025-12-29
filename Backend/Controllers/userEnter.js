const TempUser = require("../Models/TempUser");
const User = require("../Models/User");
const Blogs = require("../Models/Blog");
const jwt = require("jsonwebtoken");
const {
  verifyEmail,
  sendOTPEmail,
  sendResendOTPEmail,
} = require("../Utils/mailer");

require("dotenv").config();

module.exports.user_register_form = (req, res) => {
  const blog = {};
  const meta = {
    title: "BeyondMan | Sign Up",
  };
  res.render("../User/register.ejs", { user: req.user, meta, blog }); // Register Form
};

module.exports.user_register = async (req, res, next) => {
  try {
    const { name, username, email, password } = req.body;

    const alreadyUserByEmail = await User.findOne({ email });
    if (alreadyUserByEmail)
      return res
        .status(409)
        .json({ success: false, message: "Email already registered" });

    const alreadyUserByUsername = await User.findOne({ username });
    if (alreadyUserByUsername)
      return res
        .status(409)
        .json({ success: false, message: "Username already exists" });

    let tempUser = await TempUser.findOne({ email });
    if (tempUser) {
      const timeLimit = 60 * 15;
      const expired = Date.now() - tempUser.createdAt > timeLimit;
      if (expired) {
        await TempUser.deleteOne({ email });
        tempUser = null;
      }
    }

    if (!tempUser) {
      const otp = Math.floor(100000 + Math.random() * 900000);

      await TempUser.create({
        name,
        username,
        email,
        password,
        otp,
        otpExpiry: Date.now() + 10 * 60 * 1000, // 10 Minutes
        createdAt: Date.now(),
        status: "unverified",
      });

      await sendOTPEmail(email, otp);

      // Set verification cookie
      res.cookie(
        "pendingVerification",
        JSON.stringify({
          email,
          timestamp: Date.now(),
        }),
        {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          maxAge: 15 * 60 * 1000, // 15 minutes
          sameSite: "strict",
        }
      );

      return res.status(201).json({
        success: true,
        message: "OTP sent to your email. Please verify.",
        redirectUrl: "/verify-otp",
      });
    }

    tempUser.otp = Math.floor(100000 + Math.random() * 900000);
    tempUser.otpExpiry = Date.now() + 10 * 60 * 1000;
    await tempUser.save();

    await sendOTPEmail(email, tempUser.otp);

    // Update verification cookie
    res.cookie(
      "pendingVerification",
      JSON.stringify({
        email,
        timestamp: Date.now(),
      }),
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 15 * 60 * 1000,
        sameSite: "strict",
      }
    );

    // resend OTP email
    return res.status(201).json({
      success: false,
      message: "You already registered but didn't verify. New OTP sent.",
      redirectUrl: "/verify-otp",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Internal Error" });
  }
};

module.exports.verifyOtpPage = (req, res) => {
  const blog = {};
  const email = req.verificationEmail;
  const meta = {
    title: "BeyondMan | Sign Up",
  };
  res.render("../User/otp-verify.ejs", { user: req.user, meta, blog, email }); // OTP Verify Page
};

module.exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const tempUser = await TempUser.findOne({ email });
    if (!tempUser) {
      if (
        req.xhr ||
        req.headers["content-type"]?.includes("application/json")
      ) {
        return res.status(400).json({
          success: false,
          message: "No registration found for this email",
        });
      }
      return res.redirect("/register");
    }

    if (Date.now() > tempUser.otpExpiry) {
      if (
        req.xhr ||
        req.headers["content-type"]?.includes("application/json")
      ) {
        return res.status(400).json({
          success: false,
          message: "OTP has expired. Please request a new one",
        });
      }
      req.flash("error", "OTP has expired. Please request a new one");
      return res.redirect("/register");
    }

    if (tempUser.otp !== otp) {
      if (
        req.xhr ||
        req.headers["content-type"]?.includes("application/json")
      ) {
        return res.status(400).json({
          success: false,
          message: "Incorrect OTP. Please try again",
        });
      }

      return res.redirect("/verify-otp?email=" + encodeURIComponent(email));
    }

    // Move to main Users collection
    await User.create({
      name: tempUser.name,
      username: tempUser.username,
      email: tempUser.email,
      password: tempUser.password,
      role: "user",
    });

    // Remove temporary record
    await TempUser.deleteOne({ email });

    if (req.xhr || req.headers["content-type"]?.includes("application/json")) {
      return res.json({
        success: true,
        message: "Email verified successfully! You can now log in.",
      });
    }

    res.redirect("/login");
  } catch (error) {
    console.error("OTP verification error:", error);

    if (req.xhr || req.headers["content-type"]?.includes("application/json")) {
      return res.status(500).json({
        success: false,
        message: "Server error. Please try again later.",
      });
    }
    res.redirect("/register");
  }
};

// Add resend OTP endpoint
module.exports.resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    const tempUser = await TempUser.findOne({ email });
    if (!tempUser) {
      return res.status(400).json({
        success: false,
        message: "No registration found",
      });
    }

    // Generate new OTP
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes

    await TempUser.updateOne(
      { email },
      {
        otp: newOtp,
        otpExpiry,
        updatedAt: new Date(),
      }
    );

    await sendResendOTPEmail(email, newOtp);

    return res.json({
      success: true,
      message: "New OTP sent successfully",
    });
  } catch (error) {
    console.error("Resend OTP error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to resend OTP",
    });
  }
};
module.exports.user_login_form = (req, res) => {
  const { redirect = "/" } = req.query;
  const blog = {};
  const meta = {
    title: "BeyondMan | Login",
  };
  res.render("../User/login.ejs", { user: req.user, blog, meta, redirect }); // Login Form
};

module.exports.user_login = async (req, res, next) => {
  try {
    const { username, password, redirect } = req.body;

    // Find user by username or email
    const user = await User.findOne({
      $or: [{ username }, { email: username }],
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password",
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password",
      });
    }

    const token = jwt.sign(
      { userId: user._id, userRole: user.role },
      process.env.USER_SUPER_SECRET,
      {
        expiresIn: "7d",
      }
    );

    // Set HTTP-only cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // HTTPS only in production
      maxAge: 3 * 24 * 60 * 60 * 1000, // 3 days
      sameSite: "strict",
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
      },
      redirect,
    });
  } catch (err) {
    next(err);
  }
};

module.exports.logout = (req, res, next) => {
  try {
    // Clear the token cookie
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    // Clear any other auth-related cookies if you have them
    res.clearCookie("pendingAction");

    return res.status(200).json({
      success: true,
      message: "Logout successful",
      redirectUrl: "/",
    });
  } catch (err) {
    next(err);
  }
};
