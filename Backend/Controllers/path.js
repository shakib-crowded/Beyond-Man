const Blog = require("../Models/Blog");
const TechPath = require("../Models/techPath");

// Helper function to format title
const formatTitle = (str) => {
  if (!str) return "";
  return str
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

// Helper function to generate meta description
const generateMetaDescription = (title, customDescription) => {
  if (customDescription) return customDescription;
  return `Learn ${title} programming with comprehensive tutorials, examples, and best practices from Beyond Man.`;
};

module.exports.path = async (req, res) => {
  console.log("This endpoint hits");

  try {
    const path = `/path/${req.params.path}`;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 9;
    const skip = (page - 1) * limit;
    const blogPath = path.split("/")[2];

    // Set cache headers
    res.set("Cache-Control", "public, max-age=3600");

    // Fetch categories and language info in parallel
    const [categories, blogs, totalBlogs] = await Promise.all([
      TechPath.find().catch((err) => {
        console.error("Error fetching tech paths:", err);
        return [];
      }),
      Blog.find({ path: blogPath })
        .populate("author", "name username")
        .sort({ created_date: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .catch((err) => {
          console.error("Error fetching blogs:", err);
          return [];
        }),
      Blog.countDocuments({ blogPath }).catch((err) => {
        console.error("Error counting blogs:", err);
        return 0;
      }),
    ]);

    // Find language info
    let languageInfo = null;
    for (const category of categories) {
      const icon = category.techIcons.find(
        (icon) => icon.path.toLowerCase() === path.toLowerCase()
      );

      if (icon) {
        languageInfo = {
          ...icon.toObject(),
          category: category.title,
          metaDescription: icon.metaDescription || null,
        };
        break;
      }
    }

    const formattedTitle = formatTitle(languageInfo?.title || req.params.path);
    const pageTitle = `${formattedTitle} Articles`;
    const pageDescription = generateMetaDescription(
      formattedTitle,
      languageInfo?.metaDescription
    );
    const canonicalUrl = `${process.env.BASE_URL}${path}`;

    const totalPages = Math.ceil(totalBlogs / limit);
    // Prepare response data
    const responseData = {
      user: req.user || null,
      blog: {},
      allBlogs: blogs,
      blogPath,
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
        { name: formattedTitle, url: path },
      ],
      currentPath: path,
    };

    // Handle AJAX vs regular request
    if (req.xhr || req.get("Accept")?.includes("application/json")) {
      return res.json({
        html: renderBlogsPartial(responseData),
        pagination: {
          totalPages,
          currentPage: page,
          limit,
        },
      });
    }

    // Render the page
    res.render("path.ejs", responseData);
  } catch (err) {
    console.error("Path route error:", err);
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

// Helper function to render the blogs partial for AJAX requests
function renderBlogsPartial(data) {
  if (data.allBlogs.length === 0) {
    return `<section class="no-results">
      <h1>No results found</h1>
    </section>`;
  }

  return data.allBlogs
    .map(
      (blog) => `
    <article class="blog-card">
      <div class="card-image-container">
          <a href="/${
            blogPath / blog.slug
          }" class="card-image-link" aria-label="Read ${blog.title}">
            <img src="/images/admin_BLOGS/${blog.image.filename.replace(
              "admin_BLOGS/",
              ""
            )}"
              alt="${blog.title}" class="card-image" loading="lazy">
            <div class="image-overlay"></div>
          </a>
        </div>
        <div class="card-content">
          <h3 class="card-title">
            <a href="/${blogPath / blog.slug}">${blog.title}</a>
          </h3>
          <div class="card-meta">
            <div class="meta-author">
              <a href="/author/${
                blog.author?.name || "Unknown Author"
              }" class="author-link">
                <svg class="meta-icon" viewBox="0 0 24 24" width="16" height="16">
                  <path fill="currentColor"
                    d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z" />
                </svg>
                ${blog.author?.username || "Username Didn't Find!"}
              </a>
            </div>
            <div class="meta-date">
              <svg class="meta-icon" viewBox="0 0 24 24" width="16" height="16">
                <path fill="currentColor"
                  d="M19,19H5V8H19M16,1V3H8V1H6V3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3H18V1M17,12H12V17H17V12Z" />
              </svg>
              <time datetime="${new Date(blog.created_date).toISOString()}">
                ${new Date(blog.created_date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </time>
            </div>
          </div>
        </div>
    </article>
  `
    )
    .join("");
}
