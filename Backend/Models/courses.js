const mongoose = require("mongoose");

const courseSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please add a course title"],
      trim: true,
      maxlength: [100, "Title cannot be more than 100 characters"],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, "Please add a description"],
      maxlength: [500, "Description cannot be more than 500 characters"],
    },
    shortDescription: {
      type: String,
      maxlength: [150, "Short description cannot be more than 150 characters"],
    },
    price: {
      type: Number,
      required: [true, "Please add a course price"],
      min: [0, "Price cannot be negative"],
    },
    discountedPrice: {
      type: Number,
      validate: {
        validator: function (value) {
          return value < this.price;
        },
        message: "Discounted price must be less than regular price",
      },
    },
    category: {
      type: String,
      required: [true, "Please select a category"],
      enum: [
        "Web Development",
        "Mobile Development",
        "Data Science",
        "Programming",
        "Cyber Security",
        "Design",
        "Business",
        "Marketing",
      ],
    },
    level: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      default: "Beginner",
    },
    duration: {
      type: Number, // in minutes
      min: [1, "Duration must be at least 1 minutes"],
    },
    thumbnail: {
      type: String,
      required: [true, "Please add a thumbnail URL"],
    },
    promoVideo: String,
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
    studentsEnrolled: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    totalStudents: {
      type: Number,
      default: 0,
    },
    ratingsAverage: {
      type: Number,
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating must be at most 5"],
      default: 4.5,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    requirements: [String],
    learningOutcomes: [String],
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    publishedAt: Date,
    language: {
      type: String,
      default: "Hinglish",
    },
    subtitles: [
      {
        language: String,
        url: String,
      },
    ],
    resources: [
      {
        title: String,
        url: String,
      },
    ],
    sections: [
      {
        title: String,
        lectures: [
          {
            title: String,
            duration: Number,
            videoUrl: String,
            description: String,
            isPreview: Boolean,
          },
        ],
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual populate reviews
courseSchema.virtual("reviews", {
  ref: "Review",
  foreignField: "course",
  localField: "_id",
});

// Document middleware to create slug
courseSchema.pre("save", function (next) {
  this.slug = this.title.toLowerCase().replace(/ /g, "-");
  next();
});

// Query middleware to populate instructor
courseSchema.pre(/^find/, function (next) {
  this.populate({
    path: "instructor",
    select: "name email photo",
  });
  next();
});

// Static method to get average rating and update course
courseSchema.statics.calcAverageRatings = async function (courseId) {
  const stats = await this.aggregate([
    {
      $match: { _id: courseId },
    },
    {
      $lookup: {
        from: "reviews",
        localField: "_id",
        foreignField: "course",
        as: "reviews",
      },
    },
    {
      $addFields: {
        ratingsAverage: { $avg: "$reviews.rating" },
        ratingsQuantity: { $size: "$reviews" },
      },
    },
  ]);

  if (stats.length > 0) {
    await this.findByIdAndUpdate(courseId, {
      ratingsAverage: stats[0].ratingsAverage,
      ratingsQuantity: stats[0].ratingsQuantity,
    });
  }
};

module.exports = mongoose.model("Course", courseSchema);
