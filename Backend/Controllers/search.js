const Blog = require("../Models/Blog");

// Constants
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 9;
const ALLOWED_CHARS_REGEX = /[^a-zA-Z0-9 ]/g;

/**
 * Sanitizes user input by removing special characters and extra spaces
 * @param {string} input - Raw user input
 * @returns {string} Sanitized input
 */
const sanitizeInput = (input) => {
  if (!input || typeof input !== "string") return "";

  return input
    .trim()
    .replace(ALLOWED_CHARS_REGEX, " ")
    .replace(/\s+/g, " ")
    .trim();
};

/**
 * Parses and validates pagination parameters
 * @param {object} query - Request query object
 * @returns {object} Validated pagination parameters
 */
const getPaginationParams = (query) => {
  const page = Math.max(1, parseInt(query.page) || DEFAULT_PAGE);
  const limit = Math.max(
    1,
    Math.min(100, parseInt(query.limit) || DEFAULT_LIMIT)
  );
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

/**
 * Builds search query based on search term
 * @param {string} searchTerm - Sanitized search term
 * @returns {object} MongoDB query object
 */
const buildSearchQuery = (searchTerm) => {
  if (!searchTerm) return {};

  // Try full-text search first
  return { $text: { $search: searchTerm } };
};

/**
 * Builds regex fallback query
 * @param {string} searchTerm - Sanitized search term
 * @returns {object} MongoDB query object
 */
const buildRegexQuery = (searchTerm) => {
  const regex = new RegExp(searchTerm, "i");
  return {
    $or: [
      { path: regex },
      { title: regex },
      { author: regex },
      { tags: regex },
    ],
  };
};

/**
 * Searches for blogs using text search or regex fallback
 * @param {string} searchTerm - Sanitized search term
 * @param {number} skip - Number of documents to skip
 * @param {number} limit - Maximum number of documents to return
 * @returns {Promise<object>} Search results with blogs and total count
 */
const performSearch = async (searchTerm, skip, limit) => {
  if (!searchTerm) {
    // No search term: return latest blogs
    const totalBlogs = await Blog.countDocuments({});
    const allBlogs = await Blog.find({})
      .populate("author", "name username profile")
      .lean()
      .sort({ created_date: -1 })
      .skip(skip)
      .limit(limit);

    return { allBlogs, totalBlogs };
  }

  // Try full-text search
  const textQuery = buildSearchQuery(searchTerm);
  let totalBlogs = await Blog.countDocuments(textQuery);

  if (totalBlogs > 0) {
    const allBlogs = await Blog.find(textQuery, {
      score: { $meta: "textScore" },
    })
      .populate("author", "name username profile")
      .lean()
      .sort({ score: { $meta: "textScore" }, created_date: -1 })
      .skip(skip)
      .limit(limit);

    return { allBlogs, totalBlogs };
  }

  // Fallback to regex search
  const regexQuery = buildRegexQuery(searchTerm);
  totalBlogs = await Blog.countDocuments(regexQuery);
  const allBlogs = await Blog.find(regexQuery)
    .populate("author", "name username profile")
    .lean()
    .sort({ created_date: -1 })
    .skip(skip)
    .limit(limit);

  return { allBlogs, totalBlogs };
};

/**
 * Handles search requests for all blogs
 */
module.exports.searchAll = async (req, res) => {
  try {
    const searchTerm = sanitizeInput(req.query.search);
    const { page, limit, skip } = getPaginationParams(req.query);

    const { allBlogs, totalBlogs } = await performSearch(
      searchTerm,
      skip,
      limit
    );

    const totalPages = Math.ceil(totalBlogs / limit);

    const meta = {
      title: searchTerm ? `Search results for "${searchTerm}"` : "Latest Blogs",
      description:
        totalBlogs > 0
          ? `Page ${page} of ${totalPages} - ${totalBlogs} result${
              totalBlogs !== 1 ? "s" : ""
            } found.`
          : "No results found.",
    };

    res.render("search_results.ejs", {
      blog: {},
      allBlogs,
      user: req.user || null,
      identity: searchTerm,
      meta,
      currentPage: page,
      totalPages,
      limit,
      totalBlogs,
    });
  } catch (error) {
    console.error("Error during search:", error);
    res.status(500).render("error.ejs", {
      message: "An error occurred while searching. Please try again.",
      error: process.env.NODE_ENV === "development" ? error : {},
    });
  }
};

/**
 * Handles requests for specific blog by slug
 */
module.exports.searchSpecific = async (req, res) => {
  const { slug } = req.params;

  if (!slug) {
    return res.status(400).render("error.ejs", {
      message: "Blog slug is required.",
      error: {},
    });
  }

  try {
    const blog = await Blog.findOne({ slug })
      .populate([
        {
          path: "comments",
          populate: { path: "replies" },
        },
        {
          path: "author",
          select: "name username profile",
        },
      ])
      .lean();

    if (!blog) {
      return res.status(404).render("error.ejs", {
        message: "Blog not found.",
        error: {},
      });
    }

    const meta = {
      title: blog.title || "Blog Post",
      description: blog.description || blog.content?.substring(0, 160) || "",
      author: blog.author?.name || "Unknown",
    };

    res.render("blog.ejs", {
      blog,
      user: req.user || null,
      comments: blog.comments || [],
      meta,
    });
  } catch (error) {
    console.error("Error fetching blog:", error);
    res.status(500).render("error.ejs", {
      message: "An error occurred while loading the blog. Please try again.",
      error: process.env.NODE_ENV === "development" ? error : {},
    });
  }
};
