const { User, validateLogin } = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const loginController = async (req, res) => {
  try {
    const { error } = validateLogin(req.body);
    if (error) return res.status(400).send({ message: error.details[0].message });

    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(401).send({ message: "Invalid Email or Password" });

    // Check if user has verified their email
    if (!user.verified) {
      return res.status(401).send({ message: "Please verify your email before logging in." });
    }

    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword) return res.status(401).send({ message: "Invalid Email or Password" });

    // Update last login timestamp
    await User.findByIdAndUpdate(user._id, { lastLoginAt: new Date() });

    // Create token with user role included
    const token = user.generateAuthToken();

    // Add full team details in user info
    const userInfo = {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role || "Owner",
      isTeamMember: user.isTeamMember || false,
      ownerId: user.ownerId || null,
      companyName: user.companyName
    };

    // Set the token as a cookie
    res.cookie("authToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Use secure cookies in production
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    // Return success message and token
    res.status(200).json({ 
      token,
      user: userInfo,
      message: "Logged in successfully" 
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).send({ message: "Internal Server Error" });
  }
};

module.exports = loginController;
