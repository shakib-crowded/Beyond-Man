const Admin = require("../Models/signUpAdmin");

const authenticateAdmin = async (username, password, done) => {
  try {
    const admin = await Admin.adminSignUp.findOne({ username });

    if (!admin) {
      return done(null, false, { message: "Invalid username or password" });
    }

    const isPasswordValid = await admin.comparePassword(password);
    if (!isPasswordValid) {
      return done(null, false, { message: "Invalid username or password" });
    }

    return done(null, admin); // Admin authentication succeeded
  } catch (err) {
    return done(err);
  }
};

module.exports = { authenticateAdmin };
