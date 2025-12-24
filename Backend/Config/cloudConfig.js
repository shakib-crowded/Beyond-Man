const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

const blogStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "admin_BLOGS",
    allowedFormat: ["png", "jpg", "jpeg"],
  },
});

const adminProfileStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "author_PROFILES",
    allowedFormat: ["png", "jpg", "jpeg"],
  },
});

module.exports = { cloudinary, blogStorage, adminProfileStorage };
