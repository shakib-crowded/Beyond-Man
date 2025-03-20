const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../Utils/wrapAsync");
const {
  validateBlog,
  isCompleteProfile,
  isNotCompleteProfile,
} = require("../middleware");
const { isAdminLoggedIn, isAdminBlogOwner } = require("../middleware");
const adminController = require("../Controllers/admin");
const multer = require("multer");
const {
  blogStorage,
  authorProfileStorage,
} = require("../Config/cloudConfig.js");
const uploadBlogStorage = multer({ storage: blogStorage });
const uploadAuthorProfileStorage = multer({ storage: authorProfileStorage });
const {
  validateUploadImage,
  validateUpdateImage,
} = require("../middleware.js");

// Render Profile Page
router.get(
  "/profile",
  isAdminLoggedIn,
  isNotCompleteProfile,
  wrapAsync(adminController.admin_profile_page)
);
router.post(
  "/profile",
  (req, res, next) => {
    uploadAuthorProfileStorage.single("profile_image")(req, res, (err) => {
      if (err) {
        console.error("Multer Error:", err);
        return next(err);
      }
      next();
    });
  },
  wrapAsync(adminController.admin_profile)
);

router.get(
  "/profile-edit",
  isAdminLoggedIn,
  wrapAsync(adminController.admin_profile_update_page)
);

router.put(
  "/profile-edit",
  isAdminLoggedIn,
  (req, res, next) => {
    uploadAuthorProfileStorage.single("profile_image")(req, res, (err) => {
      if (err) {
        console.error("Multer Error: ", err);
        return next(err);
      }
      next();
    });
  },
  wrapAsync(adminController.admin_profile_update)
);

// Admin Route Where User Get Login And Sign Up
router.get("/", adminController.admin_block);

// Render Admin Page If User If Logged In
router.get(
  "/dashboard",
  isAdminLoggedIn,
  isCompleteProfile,
  adminController.admin_dashboard
);

// Render Upload Blog Page
router.get(
  "/edit",
  isAdminLoggedIn,
  isCompleteProfile,
  wrapAsync(adminController.admin_edit)
);

// Upload Blog API
router.post(
  "/upload",
  isAdminLoggedIn,
  isCompleteProfile,
  uploadBlogStorage.single("image"),
  validateUploadImage,
  validateBlog,
  wrapAsync(adminController.admin_upload)
);

// Render Blogs for Admin to Read
router.get(
  "/read",
  isAdminLoggedIn,
  isCompleteProfile,
  wrapAsync(adminController.admin_read)
);

// Edit Blog
router.get(
  "/:id/update",
  isAdminLoggedIn,
  isCompleteProfile,
  isAdminBlogOwner,
  wrapAsync(adminController.admin_update_form)
);

// Read Single Blog
router.get(
  "/read/:id",
  isAdminLoggedIn,
  isCompleteProfile,
  isAdminBlogOwner,
  wrapAsync(adminController.admin_read_single_blog)
);

// Update Blog
router.put(
  "/:id",
  isAdminLoggedIn,
  isCompleteProfile,
  isAdminBlogOwner,
  (req, res, next) => {
    uploadBlogStorage.single("image")(req, res, (err) => {
      if (err) {
        console.error("Multer Error:", err);
        return next(err);
      }
      next();
    });
  },
  validateUpdateImage,
  validateBlog,
  wrapAsync(adminController.admin_update)
);

router.delete(
  "/delete/:id",
  isAdminLoggedIn,
  isCompleteProfile,
  isAdminBlogOwner,
  wrapAsync(adminController.admin_destroy)
);

module.exports = router;
