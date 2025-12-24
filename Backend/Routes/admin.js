const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../Utils/wrapAsync");
const {
  validateBlog,
  adminAuth,
  isProfileComplete,
  redirectAdminIfAuthenticated,
} = require("../middleware");
const { isAdminBlogOwner } = require("../middleware");
const adminController = require("../Controllers/admin");
const multer = require("multer");
const {
  blogStorage,
  adminProfileStorage,
} = require("../Config/cloudConfig.js");
const uploadBlogStorage = multer({ storage: blogStorage });
const uploadAdminProfileStorage = multer({ storage: adminProfileStorage });
const {
  validateUploadImage,
  validateUpdateImage,
} = require("../middleware.js");

router.get("/", redirectAdminIfAuthenticated, wrapAsync(adminController.home));

// Render Profile Page
router.get("/profile", adminAuth, wrapAsync(adminController.show_profile_page));

router.post(
  "/profile",
  adminAuth,
  (req, res, next) => {
    uploadAdminProfileStorage.single("profile_image")(req, res, (err) => {
      if (err) {
        console.error("Multer Error:", err);
        return next(err);
      }
      next();
    });
  },
  wrapAsync(adminController.profile_complete)
);

router.get(
  "/profile-edit",
  adminAuth,
  isProfileComplete,
  wrapAsync(adminController.profile_update_page)
);

router.put(
  "/profile-edit",
  adminAuth,
  (req, res, next) => {
    uploadAdminProfileStorage.single("profile_image")(req, res, (err) => {
      if (err) {
        console.error("Multer Error: ", err);
        return next(err);
      }
      next();
    });
  },
  wrapAsync(adminController.profile_update)
);

// Render Admin Page If User If Logged In
router.get(
  "/dashboard",
  adminAuth,
  isProfileComplete,
  adminController.dashboard
);

// Render Upload Blog Page
router.get(
  "/upload",
  adminAuth,
  isProfileComplete,
  wrapAsync(adminController.upload_form)
);

// Upload Blog API
router.post(
  "/upload",
  adminAuth,
  isProfileComplete,
  uploadBlogStorage.single("image"),
  validateUploadImage,
  validateBlog,
  wrapAsync(adminController.upload)
);

// Render Blogs for Admin to Read
router.get(
  "/reads",
  adminAuth,
  isProfileComplete,
  wrapAsync(adminController.reads)
);

// Read Single Blog
router.get(
  "/read/:id",
  adminAuth,
  isProfileComplete,
  isAdminBlogOwner,
  wrapAsync(adminController.read)
);
// Edit Blog
router.get(
  "/:id/update",
  adminAuth,
  isProfileComplete,
  isAdminBlogOwner,
  validateUpdateImage,
  wrapAsync(adminController.update_form)
);

// Update Blog
router.put(
  "/:id",
  adminAuth,
  isProfileComplete,
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
  // validateUpdateImage,
  validateBlog,
  wrapAsync(adminController.update)
);

router.delete(
  "/delete/:id",
  adminAuth,
  isProfileComplete,
  isAdminBlogOwner,
  wrapAsync(adminController.destroy)
);

module.exports = router;
