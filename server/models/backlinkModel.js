const mongoose = require("mongoose");

const backlinkSchema = new mongoose.Schema({
  // Basic Information
  sourceUrl: {
    type: String,
    required: true,
    trim: true
  },
  targetUrl: {
    type: String,
    required: true,
    trim: true
  },
  anchorText: {
    type: String,
    required: true,
    trim: true
  },
  
  // Relationships
  seoAccount: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SeoAccount",
    required: true
  },
  blogPost: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "BlogPost"
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true
  },
  
  // Link Details
  linkType: {
    type: String,
    enum: ["dofollow", "nofollow"],
    default: "dofollow"
  },
  linkPlacement: {
    type: String,
    enum: ["content", "author_bio", "footer", "sidebar", "header"],
    default: "content"
  },
  
  // Source Website Metrics
  sourceDomain: {
    type: String,
    required: true,
    trim: true
  },
  sourceDA: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  sourceDR: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  sourceTraffic: {
    type: Number,
    default: 0
  },
  
  // Campaign Information
  campaign: {
    type: String,
    trim: true
  },
  cost: {
    type: Number,
    min: 0,
    default: 0
  },
  currency: {
    type: String,
    default: "USD",
    enum: ["USD", "EUR", "GBP", "CAD", "AUD"]
  },
  
  // Status and Workflow
  status: {
    type: String,
    enum: ["prospecting", "outreach", "negotiating", "content_creation", "published", "live", "lost", "removed"],
    default: "prospecting"
  },
  
  // Outreach Details
  contactEmail: {
    type: String,
    trim: true
  },
  contactName: {
    type: String,
    trim: true
  },
  outreachNotes: {
    type: String,
    trim: true
  },
  
  // Publication Details
  publishedAt: {
    type: Date
  },
  lastChecked: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Performance Metrics
  clicks: {
    type: Number,
    default: 0
  },
  impressions: {
    type: Number,
    default: 0
  },
  ctr: {
    type: Number,
    default: 0
  },
  
  // Quality Scores
  relevanceScore: {
    type: Number,
    min: 1,
    max: 10,
    default: 5
  },
  qualityScore: {
    type: Number,
    min: 1,
    max: 10,
    default: 5
  },
  
  // Additional Information
  notes: {
    type: String,
    trim: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  
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

// Middleware to update timestamps
backlinkSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Extract domain from sourceUrl if sourceDomain is not provided
  if (this.sourceUrl && !this.sourceDomain) {
    try {
      const url = new URL(this.sourceUrl);
      this.sourceDomain = url.hostname.replace('www.', '');
    } catch (error) {
      // If URL parsing fails, extract domain manually
      const domain = this.sourceUrl.replace(/^https?:\/\/(www\.)?/, '').split('/')[0];
      this.sourceDomain = domain;
    }
  }
  
  next();
});

// Create indexes for better performance
backlinkSchema.index({ seoAccount: 1 });
backlinkSchema.index({ createdBy: 1 });
backlinkSchema.index({ blogPost: 1 });
backlinkSchema.index({ status: 1 });
backlinkSchema.index({ sourceDomain: 1 });
backlinkSchema.index({ publishedAt: -1 });
backlinkSchema.index({ isActive: 1 });

const Backlink = mongoose.model("Backlink", backlinkSchema);

module.exports = Backlink;
