const express = require("express");
const router = express.Router();

router.post("/create-course", (req, res) => {
  console.log(req.body); // For debugging
  res.json({ message: "Course Created." });
});

router.get("/create-course", (req, res) => {
  res.render("../Course By Admin/createCourse");
});

router.get("/show-courses", (req, res) => {
  res.send("API Works");
});

module.exports = router;
