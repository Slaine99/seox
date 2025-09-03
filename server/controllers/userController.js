const { User } = require("../models/userModel");
const bcrypt = require("bcrypt");

// Get all users with pagination and filtering
const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, role } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build query
    let query = {};
    
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { companyName: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (role) {
      query.role = role;
    }

    // Get users with pagination
    const users = await User.find(query)
      .select('-password')
      .populate('ownerId', 'firstName lastName email companyName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await User.countDocuments(query);
    const pages = Math.ceil(total / parseInt(limit));

    res.json({
      users,
      pagination: {
        current: parseInt(page),
        pages,
        total,
        hasNext: parseInt(page) < pages,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

// Get user statistics
const getUserStats = async (req, res) => {
  try {
    console.log('=== getUserStats called ===');
    
    const totalUsers = await User.countDocuments();
    const totalAdmins = await User.countDocuments({ role: 'Admin' });
    const totalAgencies = await User.countDocuments({ role: 'Agency' });
    const totalClients = await User.countDocuments({ role: 'Client' });
    
    // Get active users (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const activeUsers = await User.countDocuments({ 
      $or: [
        { lastLoginAt: { $gte: thirtyDaysAgo } },
        { createdAt: { $gte: thirtyDaysAgo } } // Include recently created users
      ]
    });

    // Get role breakdown
    const byRole = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    console.log('User stats:', {
      totalUsers,
      totalAdmins,
      totalAgencies,
      totalClients,
      activeUsers,
      byRole
    });

    res.json({
      totalUsers,
      totalAdmins,
      totalAgencies,
      totalClients,
      active: activeUsers,
      byRole
    });
  } catch (error) {
    console.error("Error fetching user stats:", error);
    res.status(500).json({ message: "Failed to fetch user statistics" });
  }
};

// Create new user
const createUser = async (req, res) => {
  try {
    const { name, email, password, role, companyName, phoneNumber, address, ownerId } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User with this email already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Split name into firstName and lastName
    const nameParts = name.trim().split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || '';

    // Create user data
    const userData = {
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role,
      companyName,
      phoneNumber,
      address,
      verified: true // Admin-created users are automatically verified
    };

    // Add ownerId for clients
    if (role === 'Client' && ownerId) {
      userData.ownerId = ownerId;
    }

    const user = new User(userData);
    await user.save();

    // Return user without password
    const userResponse = await User.findById(user._id)
      .select('-password')
      .populate('ownerId', 'firstName lastName email companyName');

    res.status(201).json({
      message: "User created successfully",
      user: userResponse
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Failed to create user" });
  }
};

// Update user
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, companyName, phoneNumber, address, ownerId } = req.body;

    // Check if user exists
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if email is being changed and if new email already exists
    if (email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "User with this email already exists" });
      }
    }

    // Split name into firstName and lastName
    const nameParts = name.trim().split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || '';

    // Update user data
    const updateData = {
      firstName,
      lastName,
      email,
      role,
      companyName,
      phoneNumber,
      address
    };

    // Add ownerId for clients
    if (role === 'Client' && ownerId) {
      updateData.ownerId = ownerId;
    } else if (role !== 'Client') {
      updateData.ownerId = null;
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).select('-password').populate('ownerId', 'firstName lastName email companyName');

    res.json({
      message: "User updated successfully",
      user: updatedUser
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Failed to update user" });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Don't allow deleting the last admin
    if (user.role === 'Admin') {
      const adminCount = await User.countDocuments({ role: 'Admin' });
      if (adminCount <= 1) {
        return res.status(400).json({ message: "Cannot delete the last admin user" });
      }
    }

    await User.findByIdAndDelete(id);

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Failed to delete user" });
  }
};

// Reset user password
const resetUserPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    // Check if user exists
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await User.findByIdAndUpdate(id, { password: hashedPassword });

    res.json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ message: "Failed to reset password" });
  }
};

// Get clients for an agency
const getAgencyClients = async (req, res) => {
  try {
    const { agencyId } = req.params;
    console.log("=== getAgencyClients called ===");
    console.log("Agency ID:", agencyId);

    // First, let's check if the agency exists
    const agency = await User.findById(agencyId);
    console.log("Agency found:", agency ? `${agency.firstName} ${agency.lastName} (${agency.email})` : "Not found");

    // Check all clients in the database
    const allClients = await User.find({ role: 'Client' }).select('-password');
    console.log("Total clients in database:", allClients.length);
    
    // Log details of all clients to see their ownerId values
    allClients.forEach(client => {
      console.log(`Client: ${client.email}, ownerId: ${client.ownerId}, managedBy: ${client.managedBy}`);
    });

    // Try to find clients for this specific agency (check both ownerId and managedBy)
    const clients = await User.find({ 
      role: 'Client',
      $or: [
        { ownerId: agencyId },
        { managedBy: agencyId }
      ]
    }).select('-password').sort({ createdAt: -1 });

    console.log("Clients found for agency:", clients.length);

    res.json({ clients });
  } catch (error) {
    console.error("Error fetching agency clients:", error);
    res.status(500).json({ message: "Failed to fetch clients" });
  }
};

module.exports = {
  getUsers,
  getUserStats,
  createUser,
  updateUser,
  deleteUser,
  resetUserPassword,
  getAgencyClients
};
