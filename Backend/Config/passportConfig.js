const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const { authenticateAdmin } = require("../Utils/authenticateAdmin.js");
const { authenticateUser } = require("../Utils/authenticateUser.js");

const AdminModel = require("../Models/signUpAdmin").adminSignUp;
const UserModel = require("../Models/signUpUser").userSignUp;

// Initialize Passport Strategies
passport.use("admin", new LocalStrategy(authenticateAdmin));
passport.use("user", new LocalStrategy(authenticateUser));

// Serialize User (Store only ID and role in session)
passport.serializeUser((user, done) => {
  done(null, { id: user.id, role: user.role });
});

// Deserialize User (Retrieve full user details from DB)
passport.deserializeUser(async (data, done) => {
  try {
    let user;
    if (data.role === "admin") {
      user = await AdminModel.findById(data.id);
    } else {
      user = await UserModel.findById(data.id);
    }
    done(null, user);
  } catch (err) {
    done(err);
  }
});

module.exports = passport;
