const Blog = require("../Models/blogs");
const TechPath = require("../Models/techPath");

module.exports.path = async (req, res) => {
  try {
    const path = `/path/${req.params.path}`;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 9;
    const skip = (page - 1) * limit;

    // Cache control headers for better performance
    res.set("Cache-Control", "public, max-age=3600"); // Cache for 1 hour

    // Find language info with error handling
    let categories, languageInfo;
    try {
      categories = await TechPath.find().cache(3600); // Assuming you have caching
      languageInfo = categories.reduce((found, category) => {
        const icon = category.techIcons.find((icon) => icon.path === path);
        return icon ? { ...icon.toObject(), category: category.title } : found;
      }, null);
    } catch (err) {
      console.error("Error fetching tech paths:", err);
      // Continue without languageInfo rather than failing
    }

    // Get paginated blogs with error handling
    const languageName = path.split("/")[2];
    let blogs = [],
      totalBlogs = 0;
    try {
      [blogs, totalBlogs] = await Promise.all([
        Blog.find({ languageName })
          .sort({ created_date: -1 }) // Changed to -1 for newest first
          .skip(skip)
          .limit(limit)
          .lean(), // Use lean() for better performance
        Blog.countDocuments({ languageName }),
      ]);
    } catch (err) {
      console.error("Error fetching blogs:", err);
      // Continue with empty blogs rather than failing
    }

    const totalPages = Math.ceil(totalBlogs / limit);

    // Enhanced SEO metadata
    const defaultTitle = `${
      languageInfo?.title || req.params.path
    } Programming Tutorials | Beyond Man`;
    const defaultDescription =
      languageInfo?.description ||
      `Learn ${
        languageInfo?.title || req.params.path
      } programming with comprehensive tutorials, examples, and best practices from Beyond Man.`;

    const canonicalUrl = `https://beyondman.dev/${path}`;

    const meta = {
      title: languageInfo?.title
        ? `${languageInfo.title} Programming Tutorials`
        : defaultTitle,
      description: defaultDescription,
      keywords:
        languageInfo?.keywords?.join(", ") ||
        `${
          languageInfo?.title || req.params.path
        }, programming, coding, tutorial, learn ${
          languageInfo?.title || req.params.path
        }, web development`,
      canonical: canonicalUrl,
      openGraph: {
        title: defaultTitle,
        description: defaultDescription,
        type: "website",
        url: canonicalUrl,
        site_name: "Beyond Man",
      },
      structuredData: {
        "@context": "https://schema.org",
        "@type": "LearningResource",
        name: defaultTitle,
        description: defaultDescription,
        provider: {
          "@type": "Organization",
          name: "Beyond Man",
          url: "https://beyondman.dev",
        },
      },
    };

    // Prepare response data
    const responseData = {
      blog: {},
      user: req.session.user || null,
      allBlogs: blogs,
      meta,
      totalPages,
      limit,
      currentPage: page,
      languageInfo: languageInfo || {
        title: req.params.path,
        description: `Learn ${req.params.path} programming with Beyond Man`,
        category: "Programming",
      },
      // Additional SEO-friendly data
      breadcrumbs: [
        { name: "Home", url: "/" },
        { name: "Paths", url: "/paths" },
        { name: languageInfo?.title || req.params.path, url: path },
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

    // Render the page with enhanced SEO data
    res.render("path.ejs", responseData);
  } catch (err) {
    console.error(err);
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
  // You might want to use a template engine here or keep the HTML string
  // This is a simplified version - consider using EJS.renderFile or similar
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
          <a href="/${blog.slug}" class="card-image-link" aria-label="Read ${
        blog.title
      }">
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
            <a href="/${blog.slug}">${blog.title}</a>
          </h3>
          <div class="card-meta">
            <div class="meta-author">
              <a href="/author/${blog.admin}" class="author-link">
                <svg class="meta-icon" viewBox="0 0 24 24" width="16" height="16">
                  <path fill="currentColor"
                    d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z" />
                </svg>
                ${blog.author || blog.admin}
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
