const mongoose = require("mongoose");

const tokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: false, // Made optional for client invitations
  },
  token: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['email_verification', 'password_reset', 'client_invitation'],
    default: 'email_verification'
  },
  seoAccountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SeoAccount",
    required: false // Only for client invitations
  },
  expiresAt: {
    type: Date,
    default: function() {
      // Default to 1 hour for email verification, 7 days for client invitations
      if (this.type === 'client_invitation') {
        return Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
      }
      return Date.now() + 3600 * 1000; // 1 hour
    }
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create index for automatic cleanup
tokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Token = mongoose.model("token", tokenSchema);

module.exports = { Token };
