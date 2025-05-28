const express = require("express");
const router = express.Router();
const Course = require("../Models/courses");

// Add error handling
router.get("/nav-courses", async (req, res) => {
  try {
    const courses = await Course.find();
    res.status(200).json(courses);
  } catch (error) {
    console.error("Error fetching courses:", error);
    res.status(500).json({ error: "Failed to fetch courses" });
  }
});
module.exports = router;
