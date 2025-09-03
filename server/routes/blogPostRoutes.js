const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const mongoose = require("mongoose");

// Import the controller functions
const BlogPost = require("../models/blogPostModel");
const SeoAccount = require("../models/seoAccountModel");

// Test route to verify routing is working
router.get("/test", (req, res) => {
  res.json({ message: "Blog post routes are working" });
});

// Create Blog Post (Allow unauthenticated access)
const createBlogPost = async (req, res) => {
  console.log('Blog post creation request received:', {
    user: req.user || 'unauthenticated',
    body: req.body
  });
  
  try {
    // Check if user is authenticated and has proper role
    if (req.user) {
      const { role } = req.user;
      // If authenticated, check permissions: Only Admin and Agency users can create blog posts
      if (role !== 'Admin' && role !== 'Agency') {
        return res.status(403).json({ message: "Only Admin and Agency users can create blog posts" });
      }
    }

    const {
      title,
      content,
      slug,
      metaDescription,
      keywords = [],
      tags = [],
      category,
      targetAudience,
      targetKeyword,
      seoAccount: seoAccountId,
      seoAccountId: altSeoAccountId,
      publishDate,
      scheduledDate,
      status = 'draft'
    } = req.body;

    // Validate required fields
    if (!title || !content) {
      return res.status(400).json({ message: "Title and content are required" });
    }

    // Generate slug if not provided
    let finalSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    
    // Check for duplicate slugs and add a number suffix if needed
    let slugExists = await BlogPost.findOne({ slug: finalSlug });
    let counter = 1;
    
    while (slugExists) {
      finalSlug = `${slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}-${counter}`;
      slugExists = await BlogPost.findOne({ slug: finalSlug });
      counter++;
    }

    // Use seoAccountId from either field name
    const finalSeoAccountId = seoAccountId || altSeoAccountId;

    // Verify SEO account exists if provided
    let seoAccount = null;
    if (finalSeoAccountId) {
      seoAccount = await SeoAccount.findById(finalSeoAccountId);
      if (!seoAccount) {
        return res.status(404).json({ message: "SEO account not found" });
      }
    }

    // Create the blog post
    const blogPost = new BlogPost({
      title,
      slug: finalSlug,
      content,
      metaDescription,
      keywords: Array.isArray(keywords) ? keywords : [keywords].filter(Boolean),
      targetKeywords: Array.isArray(tags) ? tags : [tags].filter(Boolean),
      category,
      targetAudience,
      seoAccount: finalSeoAccountId || null,
      author: req.user ? req.user._id : null, // Allow null author for unauthenticated users
      status: status || 'draft',
      publishDate: publishDate ? new Date(publishDate) : (scheduledDate ? new Date(scheduledDate) : null),
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const savedBlogPost = await blogPost.save();
    
    // Populate the saved blog post with author and seoAccount details
    const populatedBlogPost = await BlogPost.findById(savedBlogPost._id)
      .populate('author', 'firstName lastName email')
      .populate('seoAccount', 'accountName clientName');

    console.log('Blog post created successfully:', populatedBlogPost._id);
    
    res.status(201).json({
      message: "Blog post created successfully",
      blogPost: populatedBlogPost
    });
  } catch (error) {
    console.error("Error creating blog post:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// POST route for creating blog posts (no auth required)
router.post("/", createBlogPost);

// GET route for fetching blog posts
const getBlogPosts = async (req, res) => {
  try {
    console.log('=== Blog Posts Request ===');
    console.log('User making request:', req.user);
    console.log('User ID:', req.user?.id || req.user?._id);
    console.log('User Role:', req.user?.role);
    
    let query = {};
    
    // Apply role-based filtering
    if (req.user) {
      const userId = req.user.id || req.user._id;
      console.log('Using user ID:', userId);
      
      if (req.user.role === 'Agency') {
        // Agencies should only see blog posts for SEO accounts they own or are assigned to
        const SeoAccount = require("../models/seoAccountModel");
        
        console.log('Looking for SEO accounts owned by or assigned to user:', userId);
        
        const agencySeoAccounts = await SeoAccount.find({
          $or: [
            { owner: new mongoose.Types.ObjectId(userId) },
            { assignedAgency: new mongoose.Types.ObjectId(userId) }
          ]
        }).select('_id accountName owner assignedAgency');
        
        console.log('Found agency SEO accounts:', agencySeoAccounts);
        
        const seoAccountIds = agencySeoAccounts.map(account => account._id);
        console.log('Agency SEO account IDs for filtering:', seoAccountIds);
        
        if (seoAccountIds.length === 0) {
          console.log('No SEO accounts found for this agency, returning empty results');
          return res.status(200).json({
            message: "Blog posts retrieved successfully",
            blogPosts: []
          });
        }
        
        query.seoAccount = { $in: seoAccountIds };
      }
      else if (req.user.role === 'Client') {
        // Clients should only see blog posts for their own SEO accounts
        const SeoAccount = require("../models/seoAccountModel");
        const userId = req.user.id || req.user._id;
        
        const clientSeoAccounts = await SeoAccount.find({
          owner: new mongoose.Types.ObjectId(userId)
        }).select('_id');
        
        const seoAccountIds = clientSeoAccounts.map(account => account._id);
        console.log('Client SEO account IDs:', seoAccountIds);
        
        if (seoAccountIds.length === 0) {
          return res.status(200).json({
            message: "Blog posts retrieved successfully",
            blogPosts: []
          });
        }
        
        query.seoAccount = { $in: seoAccountIds };
      }
      // Admin and Owner roles can see all blog posts (no additional filtering)
    }
    
    console.log('Final query filter:', query);
    
    // Fetch blog posts from database with role-based filtering
    const blogPosts = await BlogPost.find(query)
      .populate('author', 'firstName lastName email')
      .populate('seoAccount', 'accountName clientName')
      .sort({ createdAt: -1 }); // Sort by newest first

    console.log(`Found ${blogPosts.length} blog posts for user role: ${req.user?.role || 'unauthenticated'}`);
    console.log('Blog posts found:', blogPosts.map(post => ({
      id: post._id,
      title: post.title,
      seoAccountId: post.seoAccount?._id || post.seoAccount,
      seoAccountName: post.seoAccount?.accountName || 'Not populated'
    })));
    
    res.status(200).json({
      message: "Blog posts retrieved successfully",
      blogPosts: blogPosts
    });
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Delete Blog Post
const deleteBlogPost = async (req, res) => {
  console.log('Delete blog post request received:', {
    params: req.params,
    user: req.user || 'unauthenticated'
  });

  try {
    const { id } = req.params;

    // Check if user is authenticated and has proper role
    if (req.user) {
      const { role } = req.user;
      // If authenticated, check permissions: Only Admin and Agency users can delete blog posts
      if (role !== 'Admin' && role !== 'Agency') {
        return res.status(403).json({ message: "Only Admin and Agency users can delete blog posts" });
      }
    }

    // Find and delete the blog post
    const deletedPost = await BlogPost.findByIdAndDelete(id);
    
    if (!deletedPost) {
      return res.status(404).json({ message: "Blog post not found" });
    }

    res.status(200).json({
      success: true,
      message: "Blog post deleted successfully",
      deletedPost: deletedPost
    });
  } catch (error) {
    console.error("Error deleting blog post:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update Blog Post
const updateBlogPost = async (req, res) => {
  console.log('Update blog post request received:', {
    params: req.params,
    body: req.body,
    user: req.user || 'unauthenticated'
  });

  try {
    const { id } = req.params;
    
    // Check if user is authenticated and has proper role
    if (req.user) {
      const { role } = req.user;
      // If authenticated, check permissions: Only Admin and Agency users can update blog posts
      if (role !== 'Admin' && role !== 'Agency') {
        return res.status(403).json({ message: "Only Admin and Agency users can update blog posts" });
      }
    }

    const {
      title,
      content,
      slug,
      metaDescription,
      keywords = [],
      tags = [],
      category,
      targetAudience,
      targetKeyword,
      seoAccount: seoAccountId,
      seoAccountId: altSeoAccountId,
      publishDate,
      scheduledDate,
      status
    } = req.body;

    // Validate required fields
    if (!title || !content) {
      return res.status(400).json({ message: "Title and content are required" });
    }

    // Find the existing blog post
    const existingPost = await BlogPost.findById(id);
    if (!existingPost) {
      return res.status(404).json({ message: "Blog post not found" });
    }

    // Generate slug if changed
    let finalSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    
    // Check for duplicate slugs (excluding current post)
    if (finalSlug !== existingPost.slug) {
      let slugExists = await BlogPost.findOne({ slug: finalSlug, _id: { $ne: id } });
      let counter = 1;
      
      while (slugExists) {
        finalSlug = `${slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}-${counter}`;
        slugExists = await BlogPost.findOne({ slug: finalSlug, _id: { $ne: id } });
        counter++;
      }
    }

    // Use seoAccountId from either field name
    const finalSeoAccountId = seoAccountId || altSeoAccountId;

    // Verify SEO account exists if provided
    if (finalSeoAccountId) {
      const seoAccount = await SeoAccount.findById(finalSeoAccountId);
      if (!seoAccount) {
        return res.status(404).json({ message: "SEO account not found" });
      }
    }

    // Update the blog post
    const updateData = {
      title,
      slug: finalSlug,
      content,
      metaDescription,
      keywords: Array.isArray(keywords) ? keywords : [keywords].filter(Boolean),
      targetKeywords: Array.isArray(tags) ? tags : [tags].filter(Boolean),
      category,
      targetAudience,
      seoAccount: finalSeoAccountId || null,
      updatedAt: new Date()
    };

    // Add status if provided
    if (status) {
      updateData.status = status;
    }

    // Add publish date if provided
    if (publishDate) {
      updateData.publishDate = new Date(publishDate);
    } else if (scheduledDate) {
      updateData.publishDate = new Date(scheduledDate);
    }

    const updatedBlogPost = await BlogPost.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('author', 'firstName lastName email')
     .populate('seoAccount', 'accountName clientName');

    console.log('Blog post updated successfully:', updatedBlogPost._id);
    
    res.status(200).json({
      message: "Blog post updated successfully",
      blogPost: updatedBlogPost
    });
  } catch (error) {
    console.error("Error updating blog post:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

router.get("/", auth, getBlogPosts);
router.put("/:id", updateBlogPost);
router.delete("/:id", deleteBlogPost);

module.exports = router;
