const Blog = require("../Models/blogs");
const Contact = require("../Models/contacts");
const TechPath = require("../Models/techPath");
const Course = require("../Models/courses");

module.exports.home = async (req, res) => {
  const meta = {
    title: "Beyond Man",
    description:
      "Learn different tech stacks like Programming Languages, Website Development, Android Development, and Software Development in Hinglish.",
    keywords: "programming, web development, android development...",
  };

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 8;

  try {
    const blogs = await Blog.find()
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ created_date: -1 });
    const totalBlogs = await Blog.countDocuments();
    const totalPages = Math.ceil(totalBlogs / limit);

    // Check if the request is AJAX
    if (req.xhr || req.headers.accept?.indexOf("json") > -1) {
      return res.json({
        blogs,
        pagination: {
          totalPages,
          currentPage: page,
          limit,
        },
      });
    }

    const categories = await TechPath.find().sort({ order: 1 });
    const courses = await Course.find();

    // Regular page load
    const blog = {};
    res.render("index.ejs", {
      blog,
      user: req.session.user || null,
      allBlogs: blogs,
      meta,
      totalPages,
      limit,
      currentPage: page,
      categories,
      courses,
    });
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
  // res.render("contact", { user: req.session.user });
};

module.exports.sitemap = async (req, res) => {
  try {
    const blogs = await Blog.find();

    // Static pages
    const staticUrls = [
      "/",
      "/about",
      "/contact",
      "/path/c",
      "/path/c++",
      "/path/java",
      "/path/python",
      "/path/kotlin",
      "/path/javascript",
      "/path/go",
      "/path/php",
      "/path/ruby",
      "/path/swift",
      "/path/r",
      "/path/rust",
      "/path/dsa-in-cpp",
      "/path/dsa-in-java",
      "/path/dsa-with-python",
      "/path/html",
      "/path/css",
      "/path/typescript",
      "/path/nodejs",
      "/path/expressjs",
      "/path/android",
      "/path/androidstudio",
      "/path/jetpackcompose",
      "/path/firebase",
      "/path/gradle",
      "/path/xml",
      "/path/materialdesign",
      "/path/flutter",
      "/path/reactnative",
      "/path/xamarin",
      "/path/reactjs",
      "/path/angularjs",
      "/path/vuejs",
      "/path/svelte",
      "/path/bootstrap",
      "/path/tailwindcss",
      "/path/django",
      "/path/flask",
      "/path/laravel",
      "/path/rails",
      "/path/spring",
      "/path/aspnet",
      "/path/mysql",
      "/path/mongodb",
      "/path/postgresql",
      "/path/sqlite",
      "/path/oracle",
      "/path/redis",
      "/path/tensorflow",
      "/path/pytorch",
      "/path/numpy",
      "/path/pandas",
      "/path/jupyter",
      "/path/docker",
      "/path/kubernates",
      "/path/aws",
      "/path/azure",
      "/path/googlecloud",
      "/path/heroku",
      "/path/netlify",
      "/path/vercel",
      "/path/git",
      "/path/github",
      "/path/gitlab",
      "/path/graphql",
      "/path/figma",
      "/path/vscode",
      "/path/intellij",
    ];

    const staticUrlXml = staticUrls
      .map(
        (url) => `
      <url>
        <loc>https://beyondman.dev${url}</loc>
        <changefreq>monthly</changefreq>
        <priority>0.7</priority>
      </url>
    `
      )
      .join("");

    // Blog pages (dynamic)
    const blogUrls = blogs
      .map(
        (blog) => `
      <url>
        <loc>https://beyondman.dev/${blog.slug}</loc>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
      </url>
    `
      )
      .join("");

    // Final sitemap
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${staticUrlXml}
      ${blogUrls}
    </urlset>`;

    res.header("Content-Type", "application/xml");
    res.send(sitemap);
  } catch (error) {
    console.error("Sitemap generation error:", error);
    res.status(500).send("Could not generate sitemap");
  }
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
