const mongoose = require("mongoose");

const seoAccountSchema = new mongoose.Schema({
  // Account Information
  accountName: {
    type: String,
    required: true,
    trim: true
  },
  domain: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  niche: {
    type: String,
    required: true,
    trim: true
  },
  targetKeywords: [{
    type: String,
    trim: true
  }],
  
  // Ownership and Access
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: false // Allow null owners for unauthenticated users
  },
  assignedAgency: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user"
  },
  
  // Account Status
  status: {
    type: String,
    enum: ["active", "paused", "completed", "cancelled"],
    default: "active"
  },
  
  // SEO Metrics
  currentDA: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  targetDA: {
    type: Number,
    min: 0,
    max: 100
  },
  currentDR: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  targetDR: {
    type: Number,
    min: 0,
    max: 100
  },
  
  // Campaign Details
  monthlyBudget: {
    type: Number,
    min: 0
  },
  campaignGoals: {
    type: String,
    trim: true
  },
  targetAudience: {
    type: String,
    trim: true
  },
  
  // Contact Information
  contactEmail: {
    type: String,
    trim: true,
    lowercase: true,
    validate: {
      validator: function(email) {
        return !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      },
      message: 'Please enter a valid email address'
    }
  },
  contactPhone: {
    type: String,
    trim: true
  },
  
  // Workflow Settings
  requiresApproval: {
    type: Boolean,
    default: true
  },
  
  // Client Access
  clientUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    default: null
  },
  
  // Progress Tracking
  totalBacklinks: {
    type: Number,
    default: 0
  },
  totalBlogPosts: {
    type: Number,
    default: 0
  },
  
  // Notes and Comments
  notes: {
    type: String,
    trim: true
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

// Update the updatedAt field before saving
seoAccountSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Create indexes for better query performance
seoAccountSchema.index({ owner: 1 });
seoAccountSchema.index({ assignedAgency: 1 });
seoAccountSchema.index({ domain: 1 });
seoAccountSchema.index({ status: 1 });
seoAccountSchema.index({ clientUserId: 1 });

const SeoAccount = mongoose.model("SeoAccount", seoAccountSchema);

module.exports = SeoAccount;
