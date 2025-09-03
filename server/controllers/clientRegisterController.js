const { User, validateRegister } = require("../models/userModel");
const { Token } = require("../models/tokenModel");
const SeoAccount = require("../models/seoAccountModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Verify client invitation token
const verifyClientInvitation = async (req, res) => {
  try {
    const { token } = req.params;

    // Find the token
    const invitationToken = await Token.findOne({
      token,
      type: 'client_invitation'
    }).populate('seoAccountId');

    if (!invitationToken) {
      return res.status(400).json({
        message: "Invalid or expired invitation token"
      });
    }

    // Check if token has expired
    if (invitationToken.expiresAt < new Date()) {
      await Token.findByIdAndDelete(invitationToken._id);
      return res.status(400).json({
        message: "Invitation token has expired"
      });
    }

    // Return SEO account information for the invitation
    res.status(200).json({
      valid: true,
      seoAccount: {
        accountName: invitationToken.seoAccountId.accountName,
        domain: invitationToken.seoAccountId.domain,
        niche: invitationToken.seoAccountId.niche
      }
    });

  } catch (error) {
    console.error("Error verifying client invitation:", error);
    res.status(500).json({
      message: "Internal server error"
    });
  }
};

// Register client with invitation token
const registerClientWithInvitation = async (req, res) => {
  try {
    const { token } = req.params;
    const { firstName, lastName, email, password, confirmPassword } = req.body;

    // Validate input
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        message: "Passwords do not match"
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters long"
      });
    }

    // Find the invitation token
    const invitationToken = await Token.findOne({
      token,
      type: 'client_invitation'
    }).populate('seoAccountId');

    if (!invitationToken) {
      return res.status(400).json({
        message: "Invalid or expired invitation token"
      });
    }

    // Check if token has expired
    if (invitationToken.expiresAt < new Date()) {
      await Token.findByIdAndDelete(invitationToken._id);
      return res.status(400).json({
        message: "Invitation token has expired"
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: "User with this email already exists"
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(Number(process.env.SALT) || 10);
    const hashPassword = await bcrypt.hash(password, salt);

    // Create new client user
    const user = new User({
      firstName,
      lastName,
      email,
      password: hashPassword,
      role: 'Client', // Set role to Client so they can see blogs assigned to them
      verified: true // Auto-verify clients from invitations
    });

    const savedUser = await user.save();

    // Update SEO account with client user ID
    await SeoAccount.findByIdAndUpdate(
      invitationToken.seoAccountId._id,
      { clientUserId: savedUser._id }
    );

    // Delete the used token
    await Token.findByIdAndDelete(invitationToken._id);

    // Generate JWT token for immediate login
    const jwtToken = jwt.sign(
      { userId: savedUser._id, role: savedUser.role },
      process.env.JWTPRIVATEKEY,
      { expiresIn: "7d" }
    );

    // Set httpOnly cookie for authentication (consistent with login)
    res.cookie("authToken", jwtToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    res.status(201).json({
      message: "Client account created successfully",
      token: jwtToken, // Keep for backwards compatibility
      user: {
        id: savedUser._id,
        firstName: savedUser.firstName,
        lastName: savedUser.lastName,
        email: savedUser.email,
        role: savedUser.role
      },
      seoAccount: {
        id: invitationToken.seoAccountId._id,
        accountName: invitationToken.seoAccountId.accountName,
        domain: invitationToken.seoAccountId.domain
      }
    });

  } catch (error) {
    console.error("Error registering client:", error);
    res.status(500).json({
      message: "Internal server error"
    });
  }
};

module.exports = {
  verifyClientInvitation,
  registerClientWithInvitation
};
