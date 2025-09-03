const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const passwordComplexity = require("joi-password-complexity");

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    verified: { type: Boolean, default: false },
    verificationLinkSent: { type: Boolean, default: false },

    // New Fields
    companyName: { type: String, default: "" },
    kvkNumber: { type: String, default: "" },
    companyAddress: { type: String, default: "" },
    postalCode: { type: String, default: "" },
    city: { type: String, default: "" },
    contactPersonFirstName: { type: String, default: "" },
    contactPersonLastName: { type: String, default: "" },
    user_signature: { type: String, default: "" }, // Stores Base64 signature
    company_logo: { type: String }, // Base64-encoded logo or file path
    companyPhone: { type: String, default: "" },
    companyWebsite: { type: String, default: "" },
    companyWebsite: { type: String, default: "" },
    smtpHost: { type: String, default: "" },
    smtpUser: { type: String, default: "" },
    smtpPort: { type: String, default: "" },
    smtpPassword: { type: String, default: "" },

    // Mollie subscription details
    mollieCustomerId: { type: String, default: null },
    subscriptionId: { type: String, default: null },
    plan: { type: String, default: "monthly" },

    // New Fields for team functionality
    role: { 
      type: String, 
      enum: ["Owner", "Admin", "Viewing", "Agency", "Client"], 
      default: "Owner" 
    },
    ownerId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "user" 
    },
    isTeamMember: {
      type: Boolean,
      default: false
    },

    // SEO-specific fields for profile completion
    industry: { type: String, default: "" },
    targetAudience: { type: String, default: "" },
    currentDomainAuthority: { type: Number, default: 0 },
    monthlyTraffic: { type: String, default: "" },
    mainCompetitors: { type: String, default: "" },
    seoGoals: { type: String, default: "" },
    monthlyBudget: { type: String, default: "" },
    seoExperience: { type: String, default: "" },

    // Track last login for activity metrics
    lastLoginAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

userSchema.methods.generateAuthToken = function () {
  const token = jwt.sign(
    {
      _id: this._id,
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      role: this.role || "Owner",
      isTeamMember: this.isTeamMember || false,
      ownerId: this.ownerId || null
    },
    process.env.JWTPRIVATEKEY,
    { expiresIn: "7d" }
  );
  return token;
};

const User = mongoose.model("user", userSchema);

const validateRegister = (data) => {
  const schema = Joi.object({
    firstName: Joi.string().required().label("First Name"),
    lastName: Joi.string().required().label("Last Name"),
    email: Joi.string().email().required().label("Email"),
    password: passwordComplexity().required().label("Password"),
    role: Joi.string().valid("Owner", "Admin", "Viewing", "Agency", "Client").optional().label("Role"),
  });
  return schema.validate(data);
};

const validateLogin = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required().label("Email"),
    password: passwordComplexity().required().label("Password"),
  });
  return schema.validate(data);
};

// Validation for the new fields
const validateProfileUpdate = (data) => {
  const schema = Joi.object({
    companyName: Joi.string().required().label("Company Name"),
    companyAddress: Joi.string().required().label("Company Address"),
    postalCode: Joi.string().required().label("Postal Code"),
    city: Joi.string().required().label("City"),
    contactPersonFirstName: Joi.string().required().label("Contact Person First Name"),
    contactPersonLastName: Joi.string().required().label("Contact Person Last Name"),

  });
  return schema.validate(data);
};

module.exports = { User, validateRegister, validateLogin, validateProfileUpdate };
