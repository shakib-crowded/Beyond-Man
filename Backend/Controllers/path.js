const Blog = require("../Models/Blog");
const TechPath = require("../Models/techPath");

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Formats a hyphenated string into title case
 * @param {string} str - Hyphenated string
 * @returns {string} Title case string
 */
const formatTitle = (str) => {
  if (!str) return "";
  return str
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

/**
 * Generates meta description for SEO
 * @param {string} title - Page title
 * @param {string} customDescription - Custom description if available
 * @returns {string} Meta description
 */
const generateMetaDescription = (title, customDescription) => {
  if (customDescription) return customDescription;
  return `Learn ${title} programming with comprehensive tutorials, examples, and best practices from Beyond Man.`;
};

/**
 * Finds language information from tech paths
 * @param {Array} categories - Array of tech path categories
 * @param {string} path - Current path identifier
 * @returns {Object|null} Language info object or null
 */

const findLanguageInfo = (categories, path) => {
  for (const category of categories) {
    const icon = category.techIcons.find((icon) => icon.path === path);

    if (icon) {
      return {
        ...icon.toObject(),
        category: category.title,
        metaDescription: icon.metaDescription || null,
      };
    }
  }
  return null;
};

/**
 * Renders blog cards HTML for AJAX responses
 * @param {Array} blogs - Array of blog objects
 * @param {string} path - Current path
 * @returns {string} HTML string
 */
const renderBlogsHTML = (blogs, path) => {
  if (!blogs || blogs.length === 0) {
    return `
      <section class="no-results">
        <h1>No results found</h1>
      </section>
    `;
  }

  return blogs
    .map((blog) => {
      const imageUrl = blog.image?.filename
        ? `/images/admin_BLOGS/${blog.image.filename.replace(
            "admin_BLOGS/",
            ""
          )}`
        : "/images/placeholder.jpg";

      const authorName = blog.author?.name || "Unknown Author";
      const authorUsername = blog.author?.username || "unknown";
      const blogDate = new Date(blog.created_date);
      const formattedDate = blogDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });

      return `
        <article class="blog-card">
          <div class="card-image-container">
            <a href="/${path}/${
        blog.slug
      }" class="card-image-link" aria-label="Read ${blog.title}">
              <img 
                src="${imageUrl}"
                alt="${blog.title}" 
                class="card-image" 
                loading="lazy"
                onerror="this.src='/images/placeholder.jpg'"
              >
              <div class="image-overlay"></div>
            </a>
          </div>
          <div class="card-content">
            <h3 class="card-title">
              <a href="/${path}/${blog.slug}">${blog.title}</a>
            </h3>
            <div class="card-meta">
              <div class="meta-author">
                <a href="/author/${authorUsername}" class="author-link">
                  <svg class="meta-icon" viewBox="0 0 24 24" width="16" height="16">
                    <path fill="currentColor" d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z" />
                  </svg>
                  ${authorName}
                </a>
              </div>
              <div class="meta-date">
                <svg class="meta-icon" viewBox="0 0 24 24" width="16" height="16">
                  <path fill="currentColor" d="M19,19H5V8H19M16,1V3H8V1H6V3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3H18V1M17,12H12V17H17V12Z" />
                </svg>
                <time datetime="${blogDate.toISOString()}">${formattedDate}</time>
              </div>
            </div>
          </div>
        </article>
      `;
    })
    .join("");
};

// ============================================
// MAIN CONTROLLER
// ============================================

/**
 * Handles path page requests with pagination
 * Supports both regular page loads and AJAX requests
 */
module.exports.path = async (req, res) => {
  try {
    // Extract and validate parameters
    const path = req.params.path;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 9));
    const skip = (page - 1) * limit;

    // Set cache headers for better performance

    res.set("Cache-Control", "public, max-age=3600");

    // Fetch all required data in parallel for better performance
    const [categories, blogs, totalBlogs] = await Promise.all([
      TechPath.find().catch((err) => {
        console.error("Error fetching tech paths:", err);
        return [];
      }),
      Blog.find({ path })
        .populate("author", "name username")
        .sort({ created_date: 1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .catch((err) => {
          console.error("Error fetching blogs:", err);
          return [];
        }),
      Blog.countDocuments({ path }).catch((err) => {
        console.error("Error counting blogs:", err);
        return 0;
      }),
    ]);

    // Find language/path information
    const languageInfo = findLanguageInfo(categories, "/" + path);
    const formattedTitle = formatTitle(languageInfo?.title || path);

    // Prepare metadata
    const pageTitle = `${formattedTitle} Articles`;
    const pageDescription = generateMetaDescription(
      formattedTitle,
      languageInfo?.metaDescription
    );
    const canonicalUrl = `${process.env.BASE_URL || ""}/${path}`;
    const totalPages = Math.ceil(totalBlogs / limit);

    // Prepare response data
    const responseData = {
      user: req.user || null,
      blog: {},
      allBlogs: blogs,
      path,
      meta: {
        title: pageTitle,
        description: pageDescription,
        keywords:
          languageInfo?.keywords?.join(", ") ||
          `${formattedTitle}, programming, coding, tutorial`,
        url: canonicalUrl,
      },
      totalPages,
      limit,
      currentPage: page,
      languageInfo: languageInfo || {
        title: formattedTitle,
        description: pageDescription,
      },
      breadcrumbs: [
        { name: "Home", url: "/" },
        { name: "Paths", url: "/paths" },
        { name: formattedTitle, url: `/${path}` },
      ],
      currentPath: path,
    };

    // In your path controller, update the AJAX detection
    const isAjaxRequest =
      req.headers["x-requested-with"] === "XMLHttpRequest" ||
      req.headers["accept"]?.includes("application/json") ||
      req.xhr;

    // Replace this line in your controller:
    if (isAjaxRequest) {
      return res.json({
        success: true,
        html: renderBlogsHTML(blogs, path),
        pagination: {
          totalPages,
          currentPage: page,
          limit,
          totalBlogs,
        },
      });
    }

    // Render full page for non-AJAX requests
    res.render("path.ejs", responseData);
  } catch (err) {
    console.error("Path route error:", err);

    // Handle AJAX errors differently
    const isAjaxRequest =
      req.xhr ||
      req.headers["x-requested-with"] === "XMLHttpRequest" ||
      req.get("Accept")?.includes("application/json");

    if (isAjaxRequest) {
      return res.status(500).json({
        success: false,
        message: "An error occurred while loading content.",
      });
    }

    // Render error page for regular requests
    res.status(500).render("error", {
      meta: {
        title: "Server Error | Beyond Man",
        description: "An error occurred while processing your request.",
      },
      statusCode: 500,
      message: "Sorry, we encountered an error while loading this page.",
    });
  }
};
