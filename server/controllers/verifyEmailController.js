const { User } = require("../models/userModel");
const { Token } = require("../models/tokenModel");

const verifyEmail = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id });
    if (!user) return res.status(400).send({ message: "Invalid link" });

    const token = await Token.findOne({
      userId: user._id,
      token: req.params.token,
    });
    
    if (!token) return res.status(400).send({ message: "Invalid or expired link" });

    // Mark user as verified
    user.verified = true;
    await user.save();
    
    // Delete the token after use
    await token.deleteOne();

    res.status(200).send({ message: "Email verified successfully" });
  } catch (error) {
    console.error("Error in verifyEmail:", error);
    res.status(500).send({ message: "Internal Server Error" });
  }
};

module.exports = verifyEmail;