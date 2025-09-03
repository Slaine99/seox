const { User } = require("../models/userModel");
const { Token } = require("../models/tokenModel");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");
const bcrypt = require("bcrypt");

// Request password reset - sends an email with a reset link
exports.requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    
    // Find user by email
    const user = await User.findOne({ email });
    
    // If no user found or not verified, still return success (for security reasons)
    if (!user || !user.verified) {
      return res.status(200).send({ 
        message: "If your email exists in our system, you will receive a password reset link."
      });
    }
    
    // Check if a token already exists for this user and delete it
    let token = await Token.findOne({ userId: user._id });
    if (token) await token.deleteOne();
    
    // Create new reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    
    // Save token
    await new Token({
      userId: user._id,
      token: resetToken,
      createdAt: Date.now(),
    }).save();
    
    // Create reset link
    const clientURL = process.env.CLIENT_URL || "http://localhost:5174";
    const link = `${clientURL}/reset-password/${user._id}/${resetToken}`;
    
    // Prepare and send email
    await sendEmail(
      user.email,
      "Password Reset Request",
      {
        name: user.firstName,
        link: link,
      },
      "requestResetPassword.handlebars"
    );
    
    return res.status(200).send({ 
      message: "If your email exists in our system, you will receive a password reset link."
    });
  } catch (error) {
    console.error("Error requesting password reset:", error);
    res.status(500).send({ message: "An error occurred while processing your request." });
  }
};

// Validate reset token
exports.validateResetToken = async (req, res) => {
  try {
    const { id, token } = req.params;
    
    // Find user
    const user = await User.findById(id);
    if (!user) return res.status(400).send({ message: "Invalid link" });
    
    // Find token in database
    const resetToken = await Token.findOne({ userId: user._id, token: token });
    if (!resetToken) return res.status(400).send({ message: "Invalid or expired link" });
    
    return res.status(200).send({ message: "Valid reset token" });
  } catch (error) {
    console.error("Error validating reset token:", error);
    res.status(500).send({ message: "An error occurred while validating your reset link." });
  }
};

// Reset password
exports.resetPassword = async (req, res) => {
  try {
    const { id, token } = req.params;
    const { password } = req.body;
    
    // Find user
    const user = await User.findById(id);
    if (!user) return res.status(400).send({ message: "Invalid link" });
    
    // Find token in database
    const resetToken = await Token.findOne({ userId: user._id, token: token });
    if (!resetToken) return res.status(400).send({ message: "Invalid or expired link" });
    
    // Hash new password
    const salt = await bcrypt.genSalt(Number(process.env.SALT));
    const hashPassword = await bcrypt.hash(password, salt);
    
    // Update user password
    user.password = hashPassword;
    await user.save();
    
    // Send confirmation email
    await sendEmail(
      user.email,
      "Password Reset Successful",
      {
        name: user.firstName,
      },
      "resetPassword.handlebars"
    );
    
    // Delete the token
    await resetToken.deleteOne();
    
    return res.status(200).send({ message: "Password reset successful. You can now log in with your new password." });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).send({ message: "An error occurred while resetting your password." });
  }
};