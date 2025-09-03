const Backlink = require("../models/backlinkModel");
const SeoAccount = require("../models/seoAccountModel");
const mongoose = require("mongoose");

// Create a new backlink
const createBacklink = async (req, res) => {
  try {
    const {
      sourceUrl,
      targetUrl,
      anchorText,
      seoAccount,
      blogPost,
      linkType,
      linkPlacement,
      sourceDA,
      sourceDR,
      sourceTraffic,
      campaign,
      cost,
      currency,
      status,
      contactEmail,
      contactName,
      outreachNotes,
      relevanceScore,
      qualityScore,
      notes,
      tags
    } = req.body;

    // Validate SEO Account exists and user has access
    const seoAccountDoc = await SeoAccount.findById(seoAccount);
    if (!seoAccountDoc) {
      return res.status(404).json({ message: "SEO Account not found" });
    }

    // Check access permissions
    const userId = req.user.id || req.user._id;
    const userRole = req.user.role;
    
    if (userRole === 'Client' && seoAccountDoc.owner.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }
    
    if (userRole === 'Agency' && 
        seoAccountDoc.assignedAgency && 
        seoAccountDoc.assignedAgency.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Extract domain from sourceUrl
    let sourceDomain = '';
    try {
      const url = new URL(sourceUrl);
      sourceDomain = url.hostname.replace('www.', '');
    } catch (error) {
      return res.status(400).json({ message: "Invalid source URL format" });
    }

    const backlink = new Backlink({
      sourceUrl,
      targetUrl,
      anchorText,
      sourceDomain,
      seoAccount,
      blogPost,
      createdBy: userId,
      linkType,
      linkPlacement,
      sourceDA,
      sourceDR,
      sourceTraffic,
      campaign,
      cost,
      currency,
      status,
      contactEmail,
      contactName,
      outreachNotes,
      relevanceScore,
      qualityScore,
      notes,
      tags
    });

    await backlink.save();

    // Update backlink count in SEO Account
    await SeoAccount.findByIdAndUpdate(seoAccount, {
      $inc: { totalBacklinks: 1 }
    });

    const populatedBacklink = await Backlink.findById(backlink._id)
      .populate('seoAccount', 'accountName domain')
      .populate('blogPost', 'title')
      .populate('createdBy', 'firstName lastName');

    res.status(201).json({
      message: "Backlink created successfully",
      backlink: populatedBacklink
    });
  } catch (error) {
    console.error("Error creating backlink:", error);
    res.status(500).json({ message: "Failed to create backlink" });
  }
};

// Get backlinks with filtering and pagination
const getBacklinks = async (req, res) => {
  try {
    console.log('=== Backlinks Request ===');
    console.log('User making request:', req.user);
    console.log('User ID:', req.user?.id || req.user?._id);
    console.log('User Role:', req.user?.role);
    
    const { 
      page = 1, 
      limit = 10, 
      seoAccount, 
      status, 
      linkType, 
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const userId = req.user.id || req.user._id;
    const userRole = req.user.role;
    
    console.log('Using user ID:', userId);
    
    // Build query based on user role
    let query = {};
    
    if (userRole === 'Client') {
      // Clients can only see backlinks for their own SEO accounts
      const userSeoAccounts = await SeoAccount.find({ 
        owner: new mongoose.Types.ObjectId(userId) 
      }).select('_id');
      const seoAccountIds = userSeoAccounts.map(acc => acc._id);
      console.log('Client SEO account IDs:', seoAccountIds);
      query.seoAccount = { $in: seoAccountIds };
    } else if (userRole === 'Agency') {
      // Agencies can see backlinks for accounts they own or are assigned to
      const agencySeoAccounts = await SeoAccount.find({
        $or: [
          { owner: new mongoose.Types.ObjectId(userId) },
          { assignedAgency: new mongoose.Types.ObjectId(userId) }
        ]
      }).select('_id accountName owner assignedAgency');
      
      console.log('Found agency SEO accounts:', agencySeoAccounts);
      
      const seoAccountIds = agencySeoAccounts.map(acc => acc._id);
      console.log('Agency SEO account IDs for filtering:', seoAccountIds);
      
      if (seoAccountIds.length === 0) {
        console.log('No SEO accounts found for this agency, returning empty results');
        return res.json({
          backlinks: [],
          pagination: {
            current: parseInt(page),
            pages: 0,
            total: 0,
            hasNext: false,
            hasPrev: false
          }
        });
      }
      
      query.seoAccount = { $in: seoAccountIds };
    }
    // Admins can see all backlinks (no additional filtering)

    console.log('Final query filter:', query);

    // Add additional filters
    if (seoAccount) {
      query.seoAccount = seoAccount;
    }
    if (status) {
      query.status = status;
    }
    if (linkType) {
      query.linkType = linkType;
    }
    if (search) {
      query.$or = [
        { sourceDomain: { $regex: search, $options: 'i' } },
        { anchorText: { $regex: search, $options: 'i' } },
        { campaign: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const backlinks = await Backlink.find(query)
      .populate('seoAccount', 'accountName domain')
      .populate('blogPost', 'title')
      .populate('createdBy', 'firstName lastName')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Backlink.countDocuments(query);
    const pages = Math.ceil(total / parseInt(limit));

    console.log(`Found ${backlinks.length} backlinks for user role: ${userRole}`);
    console.log('Backlinks found:', backlinks.map(backlink => ({
      id: backlink._id,
      sourceUrl: backlink.sourceUrl,
      seoAccountId: backlink.seoAccount?._id || backlink.seoAccount,
      seoAccountName: backlink.seoAccount?.accountName || 'Not populated'
    })));

    res.json({
      backlinks,
      pagination: {
        current: parseInt(page),
        pages,
        total,
        hasNext: parseInt(page) < pages,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error("Error fetching backlinks:", error);
    res.status(500).json({ message: "Failed to fetch backlinks" });
  }
};

// Get single backlink
const getBacklink = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id || req.user._id;
    const userRole = req.user.role;

    const backlink = await Backlink.findById(id)
      .populate('seoAccount', 'accountName domain owner assignedAgency')
      .populate('blogPost', 'title')
      .populate('createdBy', 'firstName lastName');

    if (!backlink) {
      return res.status(404).json({ message: "Backlink not found" });
    }

    // Check access permissions
    if (userRole === 'Client' && backlink.seoAccount.owner.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }
    
    if (userRole === 'Agency' && 
        backlink.seoAccount.assignedAgency && 
        backlink.seoAccount.assignedAgency.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json({ backlink });
  } catch (error) {
    console.error("Error fetching backlink:", error);
    res.status(500).json({ message: "Failed to fetch backlink" });
  }
};

// Update backlink
const updateBacklink = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const userRole = req.user.role;

    const backlink = await Backlink.findById(id).populate('seoAccount');
    if (!backlink) {
      return res.status(404).json({ message: "Backlink not found" });
    }

    // Check access permissions
    if (userRole === 'Client' && backlink.seoAccount.owner.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }
    
    if (userRole === 'Agency' && 
        backlink.seoAccount.assignedAgency && 
        backlink.seoAccount.assignedAgency.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Prepare update data
    const updateData = { ...req.body, updatedAt: Date.now() };
    
    // If sourceUrl is being updated, extract the domain
    if (req.body.sourceUrl) {
      try {
        const url = new URL(req.body.sourceUrl);
        updateData.sourceDomain = url.hostname.replace('www.', '');
      } catch (error) {
        return res.status(400).json({ message: "Invalid source URL format" });
      }
    }

    const updatedBacklink = await Backlink.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    )
      .populate('seoAccount', 'accountName domain')
      .populate('blogPost', 'title')
      .populate('createdBy', 'firstName lastName');

    res.json({
      message: "Backlink updated successfully",
      backlink: updatedBacklink
    });
  } catch (error) {
    console.error("Error updating backlink:", error);
    res.status(500).json({ message: "Failed to update backlink" });
  }
};

// Delete backlink
const deleteBacklink = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const userRole = req.user.role;

    const backlink = await Backlink.findById(id).populate('seoAccount');
    if (!backlink) {
      return res.status(404).json({ message: "Backlink not found" });
    }

    // Check access permissions
    if (userRole === 'Client' && backlink.seoAccount.owner.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }
    
    if (userRole === 'Agency' && 
        backlink.seoAccount.assignedAgency && 
        backlink.seoAccount.assignedAgency.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }

    await Backlink.findByIdAndDelete(id);

    // Update backlink count in SEO Account
    await SeoAccount.findByIdAndUpdate(backlink.seoAccount._id, {
      $inc: { totalBacklinks: -1 }
    });

    res.json({ message: "Backlink deleted successfully" });
  } catch (error) {
    console.error("Error deleting backlink:", error);
    res.status(500).json({ message: "Failed to delete backlink" });
  }
};

// Get backlink summary for an SEO account
const getBacklinkSummary = async (req, res) => {
  try {
    const { seoAccountId } = req.params;
    const userId = req.user._id;
    const userRole = req.user.role;

    // Verify access to SEO account
    const seoAccount = await SeoAccount.findById(seoAccountId);
    if (!seoAccount) {
      return res.status(404).json({ message: "SEO Account not found" });
    }

    if (userRole === 'Client' && seoAccount.owner.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }
    
    if (userRole === 'Agency' && 
        seoAccount.assignedAgency && 
        seoAccount.assignedAgency.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }

    const summary = await Backlink.aggregate([
      { $match: { seoAccount: mongoose.Types.ObjectId(seoAccountId) } },
      {
        $group: {
          _id: null,
          totalBacklinks: { $sum: 1 },
          liveLinks: { $sum: { $cond: [{ $eq: ['$status', 'live'] }, 1, 0] } },
          pendingLinks: { $sum: { $cond: [{ $in: ['$status', ['prospecting', 'outreach', 'negotiating', 'content_creation']] }, 1, 0] } },
          averageDA: { $avg: '$sourceDA' },
          averageDR: { $avg: '$sourceDR' },
          totalCost: { $sum: '$cost' },
          dofollowLinks: { $sum: { $cond: [{ $eq: ['$linkType', 'dofollow'] }, 1, 0] } },
          nofollowLinks: { $sum: { $cond: [{ $eq: ['$linkType', 'nofollow'] }, 1, 0] } }
        }
      }
    ]);

    const result = summary.length > 0 ? summary[0] : {
      totalBacklinks: 0,
      liveLinks: 0,
      pendingLinks: 0,
      averageDA: 0,
      averageDR: 0,
      totalCost: 0,
      dofollowLinks: 0,
      nofollowLinks: 0
    };

    res.json({ summary: result });
  } catch (error) {
    console.error("Error fetching backlink summary:", error);
    res.status(500).json({ message: "Failed to fetch backlink summary" });
  }
};

// Get backlinks for an SEO account (for displaying in SEO Accounts page)
const getSeoAccountBacklinks = async (req, res) => {
  try {
    const { seoAccountId } = req.params;
    const { limit = 5 } = req.query;
    const userId = req.user._id;
    const userRole = req.user.role;

    // Verify access to SEO account
    const seoAccount = await SeoAccount.findById(seoAccountId);
    if (!seoAccount) {
      return res.status(404).json({ message: "SEO Account not found" });
    }

    if (userRole === 'Client' && seoAccount.owner.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }
    
    if (userRole === 'Agency' && 
        seoAccount.assignedAgency && 
        seoAccount.assignedAgency.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }

    const backlinks = await Backlink.find({ seoAccount: seoAccountId })
      .populate('blogPost', 'title')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json({ backlinks });
  } catch (error) {
    console.error("Error fetching SEO account backlinks:", error);
    res.status(500).json({ message: "Failed to fetch backlinks" });
  }
};

module.exports = {
  createBacklink,
  getBacklinks,
  getBacklink,
  updateBacklink,
  deleteBacklink,
  getBacklinkSummary,
  getSeoAccountBacklinks
};
