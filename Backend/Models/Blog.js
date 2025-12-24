const mongoose = require("mongoose");

/**
 * Generates a URL-friendly slug from a title
 * @param {string} title - The title to slugify
 * @returns {string} URL-friendly slug
 */
const generateSlug = (title) => {
  if (!title || typeof title !== "string") {
    throw new Error("Title is required and must be a string");
  }

  return title
    .replace(/\+\+/g, "pp")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .substring(0, 200); // Prevent excessively long slugs
};

const BlogSchema = new mongoose.Schema(
  {
    path: {
      type: String,
      required: [true, "Path is required"],
      trim: true,
    },
    title: {
      type: String,
      required: [true, "Blog title is required"],
      trim: true,
      minlength: [5, "Title must be at least 5 characters"],
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    slug: {
      type: String,
      unique: true,
      index: true,
      immutable: true, // Once set, should not change
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      minlength: [50, "Description must be at least 50 characters"],
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    content: {
      type: String,
      required: [true, "Content is required"],
      minlength: [100, "Content must be at least 100 characters"],
    },
    tags: {
      type: [String],
      default: [],
      validate: {
        validator: function (tags) {
          return (
            tags.length <= 10 &&
            tags.every((tag) => tag.trim().length > 0 && tag.length <= 50)
          );
        },
        message: "Maximum 10 tags allowed, each tag must be 1-50 characters",
      },
    },
    image: {
      url: {
        type: String,
        validate: {
          validator: function (v) {
            if (!v) return true; // Optional
            try {
              new URL(v);
              return /\.(jpg|jpeg|png|webp|gif)$/i.test(v);
            } catch {
              return false;
            }
          },
          message: "Please provide a valid image URL",
        },
      },
      filename: String,
      alt: {
        type: String,
        default: "Blog post image",
      },
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
      index: true,
    },
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
    isPublished: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: {
      createdAt: "created_date",
      updatedAt: "updated_date",
    },
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

// "isPublished": true,
// 6946cafb53ed470a6b0d8190

// Create text index for search
BlogSchema.index(
  { title: "text", description: "text", content: "text", tags: "text" },
  {
    weights: {
      title: 10,
      description: 5,
      tags: 3,
      content: 1,
    },
    name: "blog_search_index",
    default_language: "english",
  }
);

// Compound indexes for common queries
BlogSchema.index({ path: 1, created_date: -1 });
BlogSchema.index({ author: 1, created_date: -1 });
BlogSchema.index({ isPublished: 1, created_date: -1 });
BlogSchema.index({ slug: 1, isPublished: 1 });

// Middleware to generate slug before saving
BlogSchema.pre("save", function (next) {
  // Only generate slug for new documents or if title changed
  if (this.isNew || this.isModified("title")) {
    try {
      let slug = generateSlug(this.title);
      let counter = 1;
      const originalSlug = slug;

      // Check for existing slugs and add suffix if needed
      const checkSlugUniqueness = async () => {
        const existing = await mongoose.models.Blog.findOne({
          slug,
          _id: { $ne: this._id },
        });

        if (existing) {
          slug = `${originalSlug}-${counter++}`;
          await checkSlugUniqueness();
        }
      };

      this.slug = slug;
    } catch (error) {
      return next(error);
    }
  }
  next();
});
// Virtual for comment count
BlogSchema.virtual("commentCount").get(function () {
  return this.comments.length;
});

// Pre-hook to remove comments when blog is deleted
BlogSchema.pre("remove", async function (next) {
  await mongoose.model("Comment").deleteMany({ blog: this._id });
  next();
});

// Static method for search using searchQuery only
BlogSchema.statics.searchBlogs = async function (
  searchQuery,
  { page = 1, limit = 9, sortBy = "created_date", sortOrder = "desc" } = {}
) {
  const query = { isPublished: true };

  // Use text search for the searchQuery across multiple fields
  if (searchQuery && searchQuery.trim()) {
    query.$text = { $search: searchQuery.trim() };
  }

  const sortOptions = {};

  // Use text score for relevance if searching
  if (searchQuery && query.$text) {
    sortOptions.score = { $meta: "textScore" };
  }

  // Add the specified sort option
  sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;

  const skip = (page - 1) * limit;

  const [blogs, total] = await Promise.all([
    this.find(query)
      .populate("author", "name username profile")
      .select(
        searchQuery && query.$text ? { score: { $meta: "textScore" } } : {}
      )
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .lean(),
    this.countDocuments(query),
  ]);

  return {
    blogs,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

// Static method for getting related blogs
BlogSchema.statics.getRelatedBlogs = async function (blogId, limit = 3) {
  const blog = await this.findById(blogId).select("path tags");
  if (!blog) return [];

  return this.find({
    _id: { $ne: blogId },
    isPublished: true,
    $or: [{ path: blog.path }, { tags: { $in: blog.tags } }],
  })
    .select("title slug image description created_date")
    .populate("author", "name")
    .limit(limit)
    .sort({ created_date: -1 })
    .lean();
};

module.exports = mongoose.model("Blog", BlogSchema);
