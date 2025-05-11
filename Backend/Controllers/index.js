const Blog = require("../Models/blogs");
const Contact = require("../Models/contacts");
module.exports.home = async (req, res) => {
  const meta = {
    title: "Beyond Man",
    description:
      "Read the blogs of different tech stacks like Programming Languages, Website Development, Android Development, and Software Development.",
    keywords:
      "programming, web development, android development, software development, technology",
  };

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 8;

  try {
    const blogs = await Blog.find()
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ created_date: -1 }); // newest first
    const totalBlogs = await Blog.countDocuments();
    const totalPages = Math.ceil(totalBlogs / limit);

    const blog = {};
    if (req.session.user) {
      res.render("index.ejs", {
        blog,
        user: req.session.user,
        allBlogs: blogs,
        meta,
        totalPages,
        limit,
        currentPage: page,
      });
    } else {
      res.render("index.ejs", {
        blog,
        user: null,
        allBlogs: blogs,
        meta,
        totalPages,
        limit,
        currentPage: page,
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

module.exports.courses = (req, res) => {
  const meta = {
    title: "Beyond Man | Courses",
  };
  const blog = {};
  res.render("courses", { user: req.session.user, meta, blog });
};

module.exports.about = (req, res) => {
  const meta = {
    title: "Beyond Man | About Us",
  };
  const blog = {};
  res.render("about", { user: req.session.user, meta, blog });
};

// module.exports.contact = (req, res) => {
//   const meta = {
//     title: "Beyond Man | Contact Us",
//   };
//   const blog = {};
//   res.render("contact", { user: req.session.user, meta, blog });
// };

module.exports.contactPage = (req, res) => {
  const meta = {
    title: "Beyond Man | Contact Us",
  };
  const blog = {};
  res.render("contact", { user: req.session.user, meta, blog });
  res.render("contact", { user: req.session.user });
};

module.exports.submitQueryForm = async (req, res) => {
  try {
    const { subject, message } = req.body;

    const newContactQuery = new Contact({
      subject,
      message,
      userId: req.user._id,
    });
    await newContactQuery.save();

    req.flash("success", "Message sent successfully!");
    res.redirect("/contact"); // Redirect to the contact page (or any desired route)
  } catch (error) {
    console.error(error);
    // Contact validation failed: subject: Path `subject` is required., message: Path `message` is required

    // Path `subject` is required. Path `message` is required.
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) =>
        err.message.replace("Path ", "").replace(/`/g, "")
      );
      req.flash("error", messages.join(`\n`));
    } else {
      req.flash("error", error.message);
    }

    res.redirect("/contact"); // Redirect back to show the error message
  }
};

module.exports.privacyAndPolicy = (req, res) => {
  const meta = {
    title: "Beyond Man | Privacy Policy",
  };
  res.render("privacy_policy", { user: req.session.user, meta });
};

module.exports.termsAndConditions = (req, res) => {
  const meta = {
    title: "Beyond Man | Terms and Conditions",
  };
  res.render("terms_and_conditions", { user: req.session.user, meta });
};
