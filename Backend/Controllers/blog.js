const Blog = require("../Models/Blog");
// Constants
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 9;
const MAX_LIMIT = 50;
const ALLOWED_SEARCH_CHARS = /[^\w\s+#<>]/gi; // Only allow word characters and spaces

/**
 * Sanitize and validate search input
 */
const sanitizeSearchTerm = (input) => {
  if (!input || typeof input !== "string") return "";

  return input
    .trim()
    .replace(ALLOWED_SEARCH_CHARS, "")
    .replace(/\s+/g, " ")
    .substring(0, 100); // Limit search term length
};

/**
 * Validate and normalize pagination parameters
 */
const validatePagination = (page, limit) => {
  const validatedPage = Math.max(
    DEFAULT_PAGE,
    parseInt(page, 10) || DEFAULT_PAGE,
  );
  const validatedLimit = Math.min(
    MAX_LIMIT,
    Math.max(1, parseInt(limit, 10) || DEFAULT_LIMIT),
  );

  return {
    page: validatedPage,
    limit: validatedLimit,
    skip: (validatedPage - 1) * validatedLimit,
  };
};

/**
 * Build consistent API response
 */
const buildResponse = (data, blogMeta = {}) => ({
  success: true,
  data,
  blogMeta: {
    timestamp: new Date().toISOString(),
    ...blogMeta,
  },
});

/**
 * Build error response
 */
const buildErrorResponse = (message, error = null, statusCode = 500) => ({
  success: false,
  message,
  error:
    process.env.NODE_ENV === "development" && error ? error.message : undefined,
  timestamp: new Date().toISOString(),
});

/**
 * Search blogs controller - Only uses searchQuery
 */
module.exports.searchBlogs = async (req, res) => {
  try {
    const { search: searchQuery, page, limit } = req.query;
    const sortBy = "created_date";
    const sortOrder = "desc";

    // Sanitize inputs
    const searchTerm = sanitizeSearchTerm(searchQuery);
    const pagination = validatePagination(page, limit);

    // Perform search with only searchTerm
    const searchResult = await Blog.searchBlogs(searchTerm, {
      page: pagination.page,
      limit: pagination.limit,
      sortBy,
      sortOrder,
    });

    const response = buildResponse(searchResult.blogs, {
      searchTerm: searchTerm || null,
      pagination: {
        currentPage: searchResult.page,
        totalPages: searchResult.totalPages,
        totalResults: searchResult.total,
        hasNextPage: searchResult.page < searchResult.totalPages,
        hasPrevPage: searchResult.page > 1,
        limit: searchResult.limit,
      },
      sortInfo: {
        sortBy,
        sortOrder,
      },
    });

    // Handle different response formats
    if (req.accepts("html")) {
      // Get total blog count for stats
      const totalBlogs = await Blog.countDocuments({ isPublished: true });

      const blog = {};
      return res.render("search_results", {
        ...response,
        totalBlogs,
        blog,
        user: req.user || null,
        layout: "../Layouts/boilerplate",
        meta: {
          title: searchTerm ? `Search: "${searchTerm}"` : "All Blog Posts",
          description: `Page ${searchResult.page} of ${searchResult.totalPages} - ${searchResult.total} results found`,
          canonical: req.originalUrl,
        },
      });
    }

    // JSON response for API
    res.json(response);
  } catch (error) {
    console.error("Search controller error:", error);

    if (req.accepts("html")) {
      return res.status(500).render("error", {
        message: "Unable to perform search. Please try again.",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
        layout: "../Layouts/boilerplate",
      });
    }

    res.status(500).json(buildErrorResponse("Internal server error", error));
  }
};

/**
 * Get search suggestions (for autocomplete)
 * This now searches across title, tags, and path
 */
module.exports.getSearchSuggestions = async (req, res) => {
  try {
    const { q: query } = req.query;

    if (!query || query.length < 2) {
      return res.json(buildResponse([]));
    }

    const sanitizedQuery = sanitizeSearchTerm(query);

    // Search across multiple fields for suggestions
    const suggestions = await Blog.aggregate([
      {
        $match: {
          isPublished: true,
          $or: [
            { title: { $regex: sanitizedQuery, $options: "i" } },
            { tags: { $regex: sanitizedQuery, $options: "i" } },
            { path: { $regex: sanitizedQuery, $options: "i" } },
          ],
        },
      },
      {
        $project: {
          title: 1,
          slug: 1,
          path: 1,
          tags: 1,
          score: {
            $add: [
              {
                $cond: [
                  {
                    $regexMatch: {
                      input: "$title",
                      regex: sanitizedQuery,
                      options: "i",
                    },
                  },
                  3, // Highest score for title matches
                  0,
                ],
              },
              {
                $cond: [
                  {
                    $gt: [
                      {
                        $size: {
                          $filter: {
                            input: "$tags",
                            as: "tag",
                            cond: {
                              $regexMatch: {
                                input: "$$tag",
                                regex: sanitizedQuery,
                                options: "i",
                              },
                            },
                          },
                        },
                      },
                      0,
                    ],
                  },
                  2, // Medium score for tag matches
                  0,
                ],
              },
              {
                $cond: [
                  {
                    $regexMatch: {
                      input: "$path",
                      regex: sanitizedQuery,
                      options: "i",
                    },
                  },
                  1, // Lowest score for path matches
                  0,
                ],
              },
            ],
          },
        },
      },
      { $sort: { score: -1, created_date: -1 } },
      { $limit: 10 },
    ]);

    res.json(buildResponse(suggestions));
  } catch (error) {
    console.error("Search suggestions error:", error);

    if (req.accepts("html")) {
      return res.status(500).render("error", {
        message: "Unable to fetch suggesions search. Please try again.",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
        layout: "../Layouts/boilerplate",
      });
    }

    res
      .status(500)
      .json(buildErrorResponse("Failed to fetch suggestions", error));
  }
};

/**
 * Get popular tags and paths for search filters
 */
module.exports.getSearchFilters = async (req, res) => {
  try {
    const [popularTags, popularPaths] = await Promise.all([
      Blog.aggregate([
        { $match: { isPublished: true } },
        { $unwind: "$tags" },
        { $group: { _id: "$tags", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 20 },
      ]),
      Blog.aggregate([
        { $match: { isPublished: true } },
        { $group: { _id: "$path", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
    ]);

    res.json(
      buildResponse({
        popularTags: popularTags.map((t) => ({ name: t._id, count: t.count })),
        popularPaths: popularPaths.map((p) => ({
          name: p._id,
          count: p.count,
        })),
      }),
    );
  } catch (error) {
    console.error("Search filters error:", error);
    res.status(500).json(buildErrorResponse("Failed to fetch filters", error));
  }
};

module.exports.getBlogBySlug = async (req, res, next) => {
  try {
    const { path, slug } = req.params;

    if (!slug) {
      throw new Error("Blog slug is required");
    }

    const blog = await Blog.findOne({ path, slug })
      .populate([
        {
          path: "comments",
          match: { parentComment: null, isDeleted: false },
          populate: [
            {
              path: "author",
              select: "name username profile avatar",
            },
            {
              path: "replies",
              match: { isDeleted: false },
              populate: {
                path: "author",
                select: "name username profile avatar",
              },
              options: { sort: { createdAt: 1 }, limit: 3 },
            },
          ],
          options: { sort: { createdAt: -1 }, limit: 10 },
        },
        {
          path: "author",
          select: "name username profile",
        },
      ])
      .lean();

    if (!blog) {
      if (req.accepts("html")) {
        return res.status(404).render("page_not_found");
      }
      return res.status(404).json({
        success: false,
        message: "Blog post not found",
      });
    }

    // Mark if user liked each comment (if authenticated)
    if (req.user) {
      blog.comments.forEach((comment) => {
        comment.isLiked = comment.likes?.some(
          (like) => like.toString() === req.user.id,
        );
        comment.replies?.forEach((reply) => {
          reply.isLiked = reply.likes?.some(
            (like) => like.toString() === req.user.id,
          );
        });
      });
    }

    const currentUrl = `${blog.path}/${blog.slug}`;

    res.render("blog.ejs", {
      user: req.user || null,
      blog,
      comments: blog.comments,
      currentUrl,
      meta: {
        title: blog.title,
        description: blog.description,
        url: `${process.env.BASE_URL + "/" + blog.slug}`,
      },
    });
  } catch (error) {
    console.error(error);
    res.redirect("/");
  }
};
