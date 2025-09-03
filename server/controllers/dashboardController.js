const { User } = require('../models/userModel');
const SeoAccount = require('../models/seoAccountModel');
const BlogPost = require('../models/blogPostModel');
const Backlink = require('../models/backlinkModel');

// Get dashboard statistics
const getDashboardStats = async (req, res) => {
  try {
    console.log('=== getDashboardStats called ===');
    console.log('User requesting stats:', req.user);

    const userRole = req.user?.role;
    const userId = req.user?._id;

    // Get total agencies (users with role 'Agency')
    const totalAgencies = await User.countDocuments({ role: 'Agency' });
    console.log('Total agencies:', totalAgencies);
    
    // Get total clients (users with role 'Client')
    const totalClients = await User.countDocuments({ role: 'Client' });
    console.log('Total clients:', totalClients);
    
    // Get active users (logged in within last 30 days or recently created)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const activeUsers = await User.countDocuments({ 
      $or: [
        { lastLoginAt: { $gte: thirtyDaysAgo } },
        { createdAt: { $gte: thirtyDaysAgo } } // Count recently created users as active
      ]
    });
    console.log('Active users:', activeUsers);

    // Get SEO accounts count - role-based filtering
    let seoAccountsCount = 0;
    try {
      if (userRole === 'Admin' || userRole === 'Owner') {
        seoAccountsCount = await SeoAccount.countDocuments();
      } else {
        // For non-admin users, count only their accounts
        seoAccountsCount = await SeoAccount.countDocuments({ createdBy: userId });
      }
    } catch (seoError) {
      console.log('SEO Account model not available, using 0');
    }
    console.log('SEO accounts:', seoAccountsCount);
    
    // Get ALL blog posts count (not just published) - role-based filtering
    let totalBlogPosts = 0;
    try {
      if (userRole === 'Admin' || userRole === 'Owner') {
        totalBlogPosts = await BlogPost.countDocuments();
      } else {
        // For non-admin users, count only their blog posts
        totalBlogPosts = await BlogPost.countDocuments({ author: userId });
      }
    } catch (blogError) {
      console.log('BlogPost model not available, using 0');
    }
    console.log('Total blog posts:', totalBlogPosts);
    
    // Get ALL backlinks count (not just active) - role-based filtering
    let totalBacklinks = 0;
    try {
      if (userRole === 'Admin' || userRole === 'Owner') {
        totalBacklinks = await Backlink.countDocuments();
      } else {
        // For non-admin users, count only their backlinks
        totalBacklinks = await Backlink.countDocuments({ createdBy: userId });
      }
    } catch (backlinkError) {
      console.log('Backlink model not available, using 0');
    }
    console.log('Total backlinks:', totalBacklinks);

    // Calculate monthly revenue (this month)
    const currentMonth = new Date();
    const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    
    // For now, calculate based on number of clients/accounts
    // You should replace this with actual revenue calculation based on your business logic
    const estimatedMonthlyRevenue = (totalClients + seoAccountsCount) * 500; // $500 per client/account
    console.log('Estimated monthly revenue:', estimatedMonthlyRevenue);

    // Get user role breakdown
    const userRoleStats = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    console.log('User role stats:', userRoleStats);

    const response = {
      totalAgencies,
      totalClients,
      activeUsers,
      seoAccountsCount,
      publishedBlogPosts: totalBlogPosts, // Changed from publishedBlogPosts to totalBlogPosts
      totalBlogPosts, // Add total blog posts
      activeBacklinks: totalBacklinks, // Changed from activeBacklinks to totalBacklinks
      totalBacklinks, // Add total backlinks
      monthlyRevenue: estimatedMonthlyRevenue,
      userRoleStats,
      byRole: userRoleStats // For compatibility with existing frontend
    };

    console.log('Sending response:', response);
    res.json(response);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ 
      message: 'Error fetching dashboard statistics',
      error: error.message 
    });
  }
};

// Get recent activity
const getRecentActivity = async (req, res) => {
  try {
    console.log('=== getRecentActivity called ===');
    
    const userRole = req.user?.role;
    const userId = req.user?._id;
    const isAdmin = userRole === 'Admin' || userRole === 'Owner';
    
    const activities = [];

    // Get recent blog posts - role-based filtering
    try {
      let blogQuery = {};
      if (!isAdmin) {
        blogQuery.author = userId; // Non-admin users only see their own blog posts
      }

      const recentBlogPosts = await BlogPost.find(blogQuery)
        .sort({ createdAt: -1 })
        .limit(isAdmin ? 5 : 10) // Give more space for user's own activities
        .populate('author', 'firstName lastName')
        .select('title createdAt author status');

      recentBlogPosts.forEach(post => {
        activities.push({
          type: 'blog_post',
          title: `${isAdmin ? 'Blog post' : 'Your blog post'}: ${post.title}`,
          user: post.author ? `${post.author.firstName} ${post.author.lastName}` : 'Unknown',
          timestamp: post.createdAt,
          status: post.status || 'draft'
        });
      });
    } catch (blogError) {
      console.log('BlogPost model not available for recent activity');
    }

    // Get recent backlinks - role-based filtering
    try {
      let backlinkQuery = {};
      if (!isAdmin) {
        backlinkQuery.createdBy = userId; // Non-admin users only see their own backlinks
      }

      const recentBacklinks = await Backlink.find(backlinkQuery)
        .sort({ createdAt: -1 })
        .limit(isAdmin ? 5 : 10)
        .populate('createdBy', 'firstName lastName')
        .select('url domain createdAt createdBy status');

      recentBacklinks.forEach(backlink => {
        activities.push({
          type: 'backlink',
          title: `${isAdmin ? 'New backlink' : 'Your backlink'} from ${backlink.domain || backlink.url}`,
          user: backlink.createdBy ? `${backlink.createdBy.firstName} ${backlink.createdBy.lastName}` : 'Unknown',
          timestamp: backlink.createdAt,
          status: backlink.status || 'active'
        });
      });
    } catch (backlinkError) {
      console.log('Backlink model not available for recent activity');
    }

    // Get recent user registrations - Admin only
    if (isAdmin) {
      const recentUsers = await User.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('firstName lastName email role createdAt');

      recentUsers.forEach(user => {
        activities.push({
          type: 'user_registration',
          title: `New ${user.role?.toLowerCase() || 'user'} registered`,
          user: `${user.firstName} ${user.lastName}`,
          timestamp: user.createdAt,
          status: 'active'
        });
      });
    } else {
      // For non-admin users, show SEO account activities
      try {
        const recentSeoAccounts = await SeoAccount.find({ createdBy: userId })
          .sort({ createdAt: -1 })
          .limit(5)
          .select('accountName domain createdAt');

        recentSeoAccounts.forEach(account => {
          activities.push({
            type: 'seo_account',
            title: `Your SEO account: ${account.accountName}`,
            user: 'You',
            timestamp: account.createdAt,
            status: 'active'
          });
        });
      } catch (seoError) {
        console.log('SEO Account model not available for recent activity');
      }
    }

    // Sort all activities by timestamp and take the most recent
    const sortedActivities = activities
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, isAdmin ? 15 : 20); // Show more activities for regular users

    console.log(`Recent activities found: ${sortedActivities.length} (Role: ${userRole})`);
    res.json(sortedActivities);
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    res.status(500).json({ 
      message: 'Error fetching recent activity',
      error: error.message 
    });
  }
};

// Get enhanced user stats for user management page
const getEnhancedUserStats = async (req, res) => {
  try {
    console.log('=== getEnhancedUserStats called ===');

    // Get detailed role breakdown
    const byRole = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get total counts
    const totalUsers = await User.countDocuments();
    const totalAgencies = await User.countDocuments({ role: 'Agency' });
    const totalClients = await User.countDocuments({ role: 'Client' });
    const totalAdmins = await User.countDocuments({ role: 'Admin' });

    // Get active users (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const active = await User.countDocuments({ 
      $or: [
        { lastLoginAt: { $gte: thirtyDaysAgo } },
        { createdAt: { $gte: thirtyDaysAgo } }
      ]
    });

    const response = {
      totalUsers,
      totalAgencies,
      totalClients, 
      totalAdmins,
      active,
      byRole
    };

    console.log('Enhanced stats response:', response);
    res.json(response);
  } catch (error) {
    console.error('Error fetching enhanced user stats:', error);
    res.status(500).json({ 
      message: 'Error fetching user statistics',
      error: error.message 
    });
  }
};

module.exports = {
  getDashboardStats,
  getRecentActivity,
  getEnhancedUserStats
};
