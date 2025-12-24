const jwt = require("jsonwebtoken");

const JWT_CONFIG = {
  accessTokenSecret:
    process.env.JWT_ACCESS_SECRET || "my-access-token-secret-key",
  refreshTokenSecret:
    process.env.JWT_REFRESH_SECRET || "my-refresh-token-secret-key",
  accessTokenExpiry: "15m", // 15 Minutes
  refreshTokenExpiry: "7d", // 7 Days
};

const generateAccessToken = (userId, role) => {
  return jwt.sign(
    {
      id: userId,
      role,
    },
    JWT_CONFIG.accessTokenSecret,
    {
      expiresIn: JWT_CONFIG.accessTokenExpiry,
    }
  );
};
const generateRefreshToken = (userId, role) => {
  return jwt.sign({ id: userId, role }, JWT_CONFIG.refreshTokenSecret, {
    expiresIn: JWT_CONFIG.refreshTokenExpiry,
  });
};

const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, JWT_CONFIG.accessTokenSecret);
  } catch (error) {
    throw new Error("Invalid or expired access token");
  }
};
const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, JWT_CONFIG.refreshTokenSecret);
  } catch (error) {
    throw new Error("Invalid or expired access token");
  }
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  JWT_CONFIG,
};
