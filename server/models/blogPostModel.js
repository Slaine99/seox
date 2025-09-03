const mongoose = require("mongoose");

const blogPostSchema = new mongoose.Schema({
  // Basic Information
  title: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  content: {
    type: String,
    required: true
  },
  excerpt: {
    type: String,
    trim: true
  },
  
  // SEO Fields
  metaTitle: {
    type: String,
    trim: true
  },
  metaDescription: {
    type: String,
    trim: true
  },
  targetKeywords: [{
    type: String,
    trim: true
  }],
  
  // Relationships
  seoAccount: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SeoAccount",
    required: false  // Made optional for now
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: false  // Allow null authors for unauthenticated users
  },
  assignedWriter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user"
  },
  
  // Status and Workflow
  status: {
    type: String,
    enum: ["draft", "in_review", "approved", "published", "rejected", "scheduled"],
    default: "draft"
  },
  publishedAt: {
    type: Date
  },
  scheduledFor: {
    type: Date
  },
  
  // Content Details
  wordCount: {
    type: Number,
    default: 0
  },
  readingTime: {
    type: Number, // in minutes
    default: 0
  },
  category: {
    type: String,
    trim: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  
  // Media
  featuredImage: {
    type: String,
    trim: true
  },
  images: [{
    url: String,
    alt: String,
    caption: String
  }],
  
  // SEO Performance
  targetUrl: {
    type: String,
    trim: true
  },
  internalLinks: [{
    url: String,
    anchorText: String
  }],
  externalLinks: [{
    url: String,
    anchorText: String
  }],
  
  // Review and Feedback
  reviewNotes: {
    type: String,
    trim: true
  },
  revisionHistory: [{
    version: Number,
    changes: String,
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user"
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Analytics (to be updated via external tools)
  pageViews: {
    type: Number,
    default: 0
  },
  organicTraffic: {
    type: Number,
    default: 0
  },
  averagePosition: {
    type: Number,
    default: 0
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware to update timestamps and calculate reading time
blogPostSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Calculate reading time (average 200 words per minute)
  if (this.content && this.wordCount > 0) {
    this.readingTime = Math.ceil(this.wordCount / 200);
  }
  
  // Auto-generate slug from title if not provided
  if (this.title && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  
  next();
});

// Create indexes for better performance
blogPostSchema.index({ seoAccount: 1 });
blogPostSchema.index({ author: 1 });
blogPostSchema.index({ assignedWriter: 1 });
blogPostSchema.index({ status: 1 });
blogPostSchema.index({ publishedAt: -1 });
blogPostSchema.index({ slug: 1 }, { unique: true });
blogPostSchema.index({ targetKeywords: 1 });

const BlogPost = mongoose.model("BlogPost", blogPostSchema);

module.exports = BlogPost;
