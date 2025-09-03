const { User } = require("../models/userModel");

exports.profileController = async (req, res) => {
  try {
    // Ensure req.user exists and contains the user ID
    if (!req.user || !req.user._id) {
      console.log("Missing user ID in request:", req.user);
      return res.status(401).json({ message: "Unauthorized: No valid user ID" });
    }

    const userId = req.user._id;
    console.log("Fetching profile for user ID:", userId);
    
    const user = await User.findById(userId);
    
    if (!user) {
      console.log("User not found in database for ID:", userId);
      return res.status(404).json({ message: "User not found" });
    }
    
    // Return comprehensive user data
    return res.status(200).json({
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role || "Owner",
        isTeamMember: user.isTeamMember || false,
        companyName: user.companyName || "",
        companyAddress: user.companyAddress || "",
        postalCode: user.postalCode || "",
        city: user.city || "",
        kvkNumber: user.kvkNumber || "",
        contactPersonFirstName: user.contactPersonFirstName || "",
        contactPersonLastName: user.contactPersonLastName || "",
        user_signature: user.user_signature || "",
        company_logo: user.company_logo || "",
        companyPhone: user.companyPhone || "",
        companyWebsite: user.companyWebsite || "",
        smtpHost: user.smtpHost || "",
        smtpUser: user.smtpUser || "",
        smtpPort: user.smtpPort || "",
        // SEO-specific fields
        industry: user.industry || "",
        targetAudience: user.targetAudience || "",
        currentDomainAuthority: user.currentDomainAuthority || 0,
        monthlyTraffic: user.monthlyTraffic || "",
        mainCompetitors: user.mainCompetitors || "",
        seoGoals: user.seoGoals || "",
        monthlyBudget: user.monthlyBudget || "",
        seoExperience: user.seoExperience || "",
        // Don't return sensitive information like password or SMTP password
      }
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return res.status(500).json({ message: "Error fetching profile" });
  }
};

exports.profileUpdate = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Unauthorized: Invalid user" });
    }

    const userId = req.user._id;
    console.log("Updating profile for user ID:", userId, "with data:", req.body);
    
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: req.body },
      { new: true }
    );
    
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    
    return res.status(200).json({
      message: "Profile updated successfully",
      user: {
        _id: updatedUser._id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        role: updatedUser.role || "Owner",
        isTeamMember: updatedUser.isTeamMember || false,
        companyName: updatedUser.companyName || "",
        companyAddress: updatedUser.companyAddress || "",
        postalCode: updatedUser.postalCode || "",
        city: updatedUser.city || "",
        kvkNumber: updatedUser.kvkNumber || "",
        contactPersonFirstName: updatedUser.contactPersonFirstName || "",
        contactPersonLastName: updatedUser.contactPersonLastName || "",
        user_signature: updatedUser.user_signature || "",
        company_logo: updatedUser.company_logo || "",
        companyPhone: updatedUser.companyPhone || "",
        companyWebsite: updatedUser.companyWebsite || "",
        smtpHost: updatedUser.smtpHost || "",
        smtpUser: updatedUser.smtpUser || "",
        smtpPort: updatedUser.smtpPort || "",
        // SEO-specific fields
        industry: updatedUser.industry || "",
        targetAudience: updatedUser.targetAudience || "",
        currentDomainAuthority: updatedUser.currentDomainAuthority || 0,
        monthlyTraffic: updatedUser.monthlyTraffic || "",
        mainCompetitors: updatedUser.mainCompetitors || "",
        seoGoals: updatedUser.seoGoals || "",
        monthlyBudget: updatedUser.monthlyBudget || "",
        seoExperience: updatedUser.seoExperience || "",
        // Include all other fields as in the profileController
      }
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return res.status(500).json({ message: "Error updating profile" });
  }
};
