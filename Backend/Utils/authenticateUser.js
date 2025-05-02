const User = require("../Models/signUpUser");

const authenticateUser = async (username, password, done) => {
  try {
    const user = await User.userSignUp.findOne({
      $or: [
        { email: username },
        {
          username: username,
        },
      ],
    });
    if (!user) {
      return done(null, false, { message: "Invalid username or password" });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return done(null, false, { message: "Invalid username or password" });
    }

    return done(null, user); // User authentication succeeded
  } catch (err) {
    return done(err);
  }
};

module.exports = { authenticateUser };
