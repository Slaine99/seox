const SeoAccount = require("../models/seoAccountModel");
const BlogPost = require("../models/blogPostModel");
const Backlink = require("../models/backlinkModel");
const { sendClientInvitation } = require("../utils/clientInvitation");

// Create a new SEO account
  const createSeoAccount = async (req, res) => {
  try {
    console.log("SEO Account creation request body:", req.body);
    
    const {
      accountName,
      domain,
      niche,
      description,
      targetKeywords,
      assignedAgency,
      targetDA,
      targetDR,
      monthlyBudget,
      campaignGoals,
      targetAudience,
      notes,
      contactEmail,
      contactPhone,
      requiresApproval
    } = req.body;

    console.log("Extracted fields:", {
      accountName,
      domain,
      niche,
      contactEmail,
      contactPhone
    });

    // Handle field mapping - frontend sends "description" but we need "niche"
    const finalNiche = niche || description;

    // Validate required fields
    if (!accountName || !domain || !finalNiche) {
      console.log("Validation failed:", { accountName: !!accountName, domain: !!domain, niche: !!finalNiche });
      return res.status(400).json({
        message: "Account name, domain, and niche are required"
      });
    }    // Check if domain already exists
    const existingAccount = await SeoAccount.findOne({ domain: domain.toLowerCase() });
    if (existingAccount) {
      return res.status(400).json({
        message: "An SEO account for this domain already exists"
      });
    }

    // Set owner based on user role (if authenticated)
    let owner = req.user ? req.user._id : null;
    let validAssignedAgency = null;
    
    // Validate assignedAgency if provided
    if (assignedAgency && assignedAgency !== "" && assignedAgency !== "testtt") {
      // Check if it's a valid ObjectId format (24 character hex string)
      if (/^[0-9a-fA-F]{24}$/.test(assignedAgency)) {
        validAssignedAgency = assignedAgency;
        if (req.user && req.user.role === "Admin") {
          // Admin can create accounts for specific agencies
          owner = assignedAgency;
        }
      } else {
        console.log("Invalid assignedAgency format:", assignedAgency);
      }
    }

    const seoAccount = new SeoAccount({
      accountName,
      domain: domain.toLowerCase(),
      niche: finalNiche,
      targetKeywords: targetKeywords || [],
      owner,
      assignedAgency: validAssignedAgency,
      targetDA,
      targetDR,
      monthlyBudget,
      campaignGoals,
      targetAudience,
      notes,
      contactEmail,
      contactPhone,
      requiresApproval: requiresApproval || false
    });

    console.log("Creating SEO account with data:", {
      accountName: seoAccount.accountName,
      domain: seoAccount.domain,
      niche: seoAccount.niche,
      contactEmail: seoAccount.contactEmail
    });

    const savedAccount = await seoAccount.save();
    await savedAccount.populate('owner', 'name email role');
    
    if (savedAccount.assignedAgency) {
      await savedAccount.populate('assignedAgency', 'name email role');
    }

    // Send client invitation email if contact email is provided
    let emailSent = false;
    if (contactEmail) {
      console.log("Contact email found, attempting to send invitation:", contactEmail);
      try {
        await sendClientInvitation(contactEmail, savedAccount);
        console.log(`Client invitation sent to ${contactEmail} for account ${accountName}`);
        emailSent = true;
      } catch (emailError) {
        console.error("Failed to send client invitation:", emailError);
        // Don't fail the account creation if email fails
      }
    } else {
      console.log("No contact email provided, skipping invitation");
    }

    res.status(201).json({
      message: emailSent ? 
        "SEO account created successfully and client invitation sent!" :
        "SEO account created successfully",
      seoAccount: savedAccount,
      clientInvitationSent: emailSent
    });

  } catch (error) {
    console.error("Error creating SEO account:", error);
    res.status(500).json({
      message: "Failed to create SEO account"
    });
  }
};

// Get all SEO accounts
const getSeoAccounts = async (req, res) => {
  try {
    console.log("=== getSeoAccounts called ===");
    console.log("User from req.user:", req.user);
    console.log("User role:", req.user?.role);
    console.log("User ID:", req.user?._id);
    
    const { page = 1, limit = 10, status, niche, search } = req.query;
    
    let query = {};
    
    // Role-based access control (only if user is authenticated)
    if (req.user) {
      if (req.user.role === "Client") {
        query.clientUserId = req.user._id;
        console.log("Client filter applied:", query);
      } else if (req.user.role === "Agency") {
        query.$or = [
          { owner: req.user._id },
          { assignedAgency: req.user._id }
        ];
        console.log("Agency filter applied:", query);
      } else {
        console.log("Admin user - no filter applied");
      }
      // Admin can see all accounts
    }
    // If no user (unauthenticated), show all accounts
    
    console.log("Final query:", JSON.stringify(query, null, 2));

    // Apply filters
    if (status) {
      query.status = status;
    }
    
    if (niche) {
      query.niche = { $regex: niche, $options: "i" };
    }
    
    if (search) {
      query.$or = [
        { accountName: { $regex: search, $options: "i" } },
        { domain: { $regex: search, $options: "i" } },
        { niche: { $regex: search, $options: "i" } }
      ];
    }

    const skip = (page - 1) * limit;
    
    const accounts = await SeoAccount.find(query)
      .populate('owner', 'name email role')
      .populate('assignedAgency', 'name email role')
      .populate('clientUserId', 'firstName lastName email role')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await SeoAccount.countDocuments(query);
    
    console.log("Found accounts:", accounts.length);
    console.log("Total accounts in DB:", total);
    console.log("Accounts data:", accounts.map(acc => ({ 
      id: acc._id, 
      name: acc.accountName, 
      domain: acc.domain,
      owner: acc.owner?._id,
      assignedAgency: acc.assignedAgency?._id 
    })));

    res.json({
      seoAccounts: accounts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error("Error fetching SEO accounts:", error);
    res.status(500).json({
      message: "Failed to fetch SEO accounts"
    });
  }
};

// Get a single SEO account
const getSeoAccount = async (req, res) => {
  try {
    const { id } = req.params;
    
    const account = await SeoAccount.findById(id)
      .populate('owner', 'name email role')
      .populate('assignedAgency', 'name email role');
    
    if (!account) {
      return res.status(404).json({
        message: "SEO account not found"
      });
    }

    // Check access permissions - Admin can view any account
    const hasAccess = req.user.role === "Admin" || 
                     (account.owner && account.owner._id.toString() === req.user._id) ||
                     (account.assignedAgency && account.assignedAgency._id.toString() === req.user._id);

    if (!hasAccess) {
      console.log('View access denied for user:', {
        userRole: req.user.role,
        userId: req.user._id,
        accountOwner: account.owner?._id?.toString(),
        assignedAgency: account.assignedAgency?._id?.toString()
      });
      return res.status(403).json({
        message: "Access denied"
      });
    }

    // Get related statistics
    const [blogPostCount, backlinkCount] = await Promise.all([
      BlogPost.countDocuments({ seoAccount: id }),
      Backlink.countDocuments({ seoAccount: id, isActive: true })
    ]);

    res.json({
      account: {
        ...account.toObject(),
        totalBlogPosts: blogPostCount,
        totalBacklinks: backlinkCount
      }
    });

  } catch (error) {
    console.error("Error fetching SEO account:", error);
    res.status(500).json({
      message: "Failed to fetch SEO account"
    });
  }
};

// Update an SEO account
const updateSeoAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const account = await SeoAccount.findById(id);
    if (!account) {
      return res.status(404).json({
        message: "SEO account not found"
      });
    }

    // Check permissions - Admin can edit any account
    const canEdit = req.user.role === "Admin" || 
                   (account.owner && account.owner.toString() === req.user._id) ||
                   (account.assignedAgency && account.assignedAgency.toString() === req.user._id);

    if (!canEdit) {
      console.log('Access denied for user:', {
        userRole: req.user.role,
        userId: req.user._id,
        accountOwner: account.owner?.toString(),
        assignedAgency: account.assignedAgency?.toString()
      });
      return res.status(403).json({
        message: "Access denied"
      });
    }

    // Remove fields that shouldn't be updated directly
    delete updates.owner;
    delete updates.totalBacklinks;
    delete updates.totalBlogPosts;
    delete updates.createdAt;

    Object.assign(account, updates);
    await account.save();

    await account.populate('owner', 'name email role');
    if (account.assignedAgency) {
      await account.populate('assignedAgency', 'name email role');
    }

    res.json({
      message: "SEO account updated successfully",
      account
    });

  } catch (error) {
    console.error("Error updating SEO account:", error);
    res.status(500).json({
      message: "Failed to update SEO account"
    });
  }
};

// Delete an SEO account
const deleteSeoAccount = async (req, res) => {
  try {
    const { id } = req.params;

    const account = await SeoAccount.findById(id);
    if (!account) {
      return res.status(404).json({
        message: "SEO account not found"
      });
    }

    // Only admin or account owner can delete - Admin can delete any account
    const canDelete = req.user.role === "Admin" || 
                     (account.owner && account.owner.toString() === req.user._id);

    if (!canDelete) {
      console.log('Delete access denied for user:', {
        userRole: req.user.role,
        userId: req.user._id,
        accountOwner: account.owner?.toString()
      });
      return res.status(403).json({
        message: "Access denied"
      });
    }

    // Check if there are related blog posts or backlinks
    const [blogPostCount, backlinkCount] = await Promise.all([
      BlogPost.countDocuments({ seoAccount: id }),
      Backlink.countDocuments({ seoAccount: id })
    ]);

    if (blogPostCount > 0 || backlinkCount > 0) {
      return res.status(400).json({
        message: `Cannot delete account. It has ${blogPostCount} blog posts and ${backlinkCount} backlinks. Please remove them first.`
      });
    }

    await SeoAccount.findByIdAndDelete(id);

    res.json({
      message: "SEO account deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting SEO account:", error);
    res.status(500).json({
      message: "Failed to delete SEO account"
    });
  }
};

// Get SEO accounts for a specific agency
const getSeoAccountsForAgency = async (req, res) => {
  try {
    const { agencyId } = req.params;
    console.log("=== getSeoAccountsForAgency called ===");
    console.log("Agency ID:", agencyId);

    // Find SEO accounts where assignedAgency matches the agencyId
    // OR where the owner is the agency (in case agency created their own accounts)
    const seoAccounts = await SeoAccount.find({
      $or: [
        { assignedAgency: agencyId },
        { owner: agencyId }
      ]
    })
    .populate('owner', 'firstName lastName email companyName')
    .populate('assignedAgency', 'firstName lastName email companyName')
    .sort({ createdAt: -1 });

    console.log("SEO Accounts found for agency:", seoAccounts.length);
    
    res.json({ seoAccounts });
  } catch (error) {
    console.error("Error fetching SEO accounts for agency:", error);
    res.status(500).json({
      message: "Failed to fetch SEO accounts for agency"
    });
  }
};

module.exports = {
  createSeoAccount,
  getSeoAccounts,
  getSeoAccount,
  updateSeoAccount,
  deleteSeoAccount,
  getSeoAccountsForAgency
};
