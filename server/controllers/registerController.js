const { User, validateRegister } = require("../models/userModel");
const { Token } = require("../models/tokenModel");
const sendEmail = require("../utils/sendEmail");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

const registerController = async (req, res) => {
  try {
    const { error } = validateRegister(req.body);
    if (error) return res.status(400).send({ message: error.details[0].message });

    // Check if user already exists
    let user = await User.findOne({ email: req.body.email });
    
    if (user && user.verified) {
      return res.status(409).send({ message: "User with given email already exists" });
    }
    
    if (user && user.verificationLinkSent) {
      return res.status(400).send({
        message: "A verification link has already been sent to this email"
      });
    }

    // Hash the user's password
    const salt = await bcrypt.genSalt(Number(process.env.SALT));
    const hashPassword = await bcrypt.hash(req.body.password, salt);

    // Create new user or update existing unverified user
    if (!user) {
      user = await new User({
        ...req.body,
        password: hashPassword,
      }).save();
    } else {
      // Update existing unverified user
      user.firstName = req.body.firstName;
      user.lastName = req.body.lastName;
      user.password = hashPassword;
      await user.save();
    }

    // Generate verification token
    const token = await new Token({
      userId: user._id,
      token: crypto.randomBytes(32).toString("hex"),
    }).save();

    // Create verification URL
    const clientURL = process.env.CLIENT_URL || "http://localhost:5174";
    const url = `${clientURL}/users/${user._id}/verify/${token.token}`;

    // Send verification email
    await sendEmail(
      user.email,
      "Verify Your Email",
      {
        name: user.firstName,
        link: url,
      },
      "verifyEmail.handlebars"
    );

    // Mark that verification link has been sent
    user.verificationLinkSent = true;
    await user.save();

    res.status(201).send({
      message: `Verification email sent to ${user.email}. Please check your inbox.`
    });
  } catch (error) {
    console.error("Error in register:", error);
    res.status(500).send({ message: "Internal Server Error" });
  }
};

module.exports = registerController;
