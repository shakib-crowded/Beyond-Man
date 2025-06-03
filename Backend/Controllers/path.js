const Blog = require("../Models/blogs");
const TechPath = require("../Models/techPath");

module.exports.path = async (req, res) => {
  try {
    const path = `/path/${req.params.path}`;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 9;
    const skip = (page - 1) * limit;

    // Find language info
    const categories = await TechPath.find();
    const languageInfo = categories.reduce((found, category) => {
      const icon = category.techIcons.find((icon) => icon.path === path);
      return icon ? { ...icon.toObject(), category: category.title } : found;
    }, null);

    // Get paginated blogs
    const languageName = path.split("/")[2];
    const [blogs, totalBlogs] = await Promise.all([
      Blog.find({ languageName })
        .sort({ created_date: 1 }) // Sort by newest first
        .skip(skip)
        .limit(limit),
      Blog.countDocuments({ languageName }),
    ]);

    const totalPages = Math.ceil(totalBlogs / limit);

    // Prepare response data
    const meta = {
      title: languageInfo?.title || "Beyond Man",
      description:
        languageInfo?.description || "Learn programming with Beyond Man",
    };

    const responseData = {
      blog: {},
      user: req.session.user || null,
      allBlogs: blogs,
      meta,
      totalPages,
      limit,
      currentPage: page,
      languageInfo,
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

    res.render("path.ejs", responseData);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
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
