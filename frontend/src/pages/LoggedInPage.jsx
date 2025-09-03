import React, { useEffect, useState } from "react";
import { useProfile } from "../context/profileContext";
import Nav from "/src/components/Chat/Nav.jsx";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Link } from "react-router-dom";
import { 
  UserIcon,
  PlusIcon,
  DocumentTextIcon,
  LinkIcon,
  ChartBarIcon,
  EyeIcon,
  PencilIcon,
  CheckIcon,
  XIcon
} from "@heroicons/react/outline";
import { useAuth } from "../context/authContext";
import { getDashboardStats, getRecentActivity } from "../services/api";

const LoggedInPage = () => {
  const { userDetails, refreshUserDetails } = useProfile();
  const { logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  
  // SEO Platform Data
  const [seoAccounts, setSeoAccounts] = useState([]);
  const [blogPosts, setBlogPosts] = useState([]);
  const [backlinks, setBacklinks] = useState([]);
  const [isNewUser, setIsNewUser] = useState(false);
  const [userData, setUserData] = useState({});
  const [dashboardStats, setDashboardStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);

  // Role-based stats
  const [stats, setStats] = useState({
    totalAccounts: 0,
    totalBlogs: 0,
    publishedBlogs: 0,
    pendingBlogs: 0,
    totalBacklinks: 0,
    avgDomainAuthority: 0
  });

  useEffect(() => {
    if (userDetails) {
      checkNewUser();
      if (!isNewUser) {
        fetchDashboardData();
      }
    }
  }, [userDetails]);

  const checkNewUser = () => {
    // For SEO platform, check if user needs to complete SEO profile
    // Admin and Owner roles don't need to complete profile, or if they already have the required fields
    const isAdminOrOwner = userDetails?.role === 'Admin' || userDetails?.role === 'Owner';
    const hasRequiredFields = userDetails?.companyWebsite && userDetails?.industry;
    
    if (!isAdminOrOwner && !hasRequiredFields) {
      setIsNewUser(true);
    } else {
      setIsNewUser(false);
    }
    setLoading(false);
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      console.log("Fetching dashboard data...");
      
      // Fetch real dashboard stats and activity
      const [statsData, activityData] = await Promise.all([
        getDashboardStats(),
        getRecentActivity()
      ]);
      
      console.log("Dashboard stats received:", statsData);
      console.log("Recent activity received:", activityData);
      
      setDashboardStats(statsData);
      setRecentActivity(activityData);
      
      // Update stats object for compatibility
      const updatedStats = {
        totalAccounts: statsData.seoAccountsCount || 0,
        totalBlogs: statsData.totalBlogPosts || 0, // Changed to use totalBlogPosts
        publishedBlogs: statsData.publishedBlogPosts || 0,
        pendingBlogs: 0,
        totalBacklinks: statsData.totalBacklinks || 0, // Changed to use totalBacklinks
        avgDomainAuthority: 65, // This could come from actual calculations later
        totalAgencies: statsData.totalAgencies || 0,
        totalClients: statsData.totalClients || 0,
        activeUsers: statsData.activeUsers || 0
      };
      
      setStats(updatedStats);
      setSeoAccounts([]);
      setBlogPosts([]);
      setBacklinks([]);
      
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load dashboard data");
      
      // Fallback to mock data
      const mockStats = {
        totalAccounts: 0,
        totalBlogs: 0,
        publishedBlogs: 0,
        pendingBlogs: 0,
        totalBacklinks: 0,
        avgDomainAuthority: 0,
        totalAgencies: 0,
        totalClients: 0,
        activeUsers: 0
      };
      
      setStats(mockStats);
      setSeoAccounts([]);
      setBlogPosts([]);
      setBacklinks([]);
      
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleSubmitUserData = async () => {
    try {
      // Validate required fields are filled
      if (!userData.companyWebsite || !userData.industry) {
        toast.error("Please fill in at least Website URL and Industry fields");
        return;
      }

      const response = await axios.put("/api/user/profile/update", userData);
      toast.success("SEO profile completed successfully!");
      
      // Immediately set profile as complete if we have the required fields
      setIsNewUser(false);
      
      // Also refresh user details in the background
      refreshUserDetails();
      
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    }
  };

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setLoggingOut(false);
    }
  };

  const formatNumber = (num) => {
    if (num === undefined || num === null) return '0';
    return new Intl.NumberFormat('en-US').format(num);
  };

  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const firstName = userDetails?.firstName || "User";

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Nav />

      <div className="flex-1 ml-64 p-6">
        {/* Header with user dropdown */}
        <div className="absolute top-4 right-4">
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shadow-md hover:shadow-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              title={`${userDetails?.firstName || "User"} ${userDetails?.lastName || ""}`}
            >
              <UserIcon className="h-5 w-5" />
            </button>
            
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-md shadow-lg z-10 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                  <p className="text-sm font-semibold text-gray-700">{`${userDetails?.firstName || "User"} ${userDetails?.lastName || ""}`}</p>
                  <p className="text-xs text-gray-500 truncate">{userDetails?.email || ""}</p>
                  <p className="text-xs text-blue-600 capitalize">{userDetails?.role}</p>
                </div>
                
                <div className="py-1">
                  <Link
                    to="/profile"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <svg className="h-4 w-4 mr-2 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Settings
                  </Link>
                  
                  <button
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-75"
                  >
                    <svg className="h-4 w-4 mr-2 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    {loggingOut ? "Logging out..." : "Logout"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        {isNewUser && userDetails?.role !== 'Admin' && userDetails?.role !== 'Owner' ? (
          <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-3xl mx-auto mt-12">
            <h2 className="text-2xl font-bold text-blue-600 mb-6">Complete Your SEO Profile</h2>
            <p className="text-gray-600 mb-4">Help us understand your SEO needs and goals to provide better service.</p>
            <p className="text-sm text-red-600 mb-6">* Required fields - At minimum, please provide your website URL and industry.</p>
            <form>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {[
                  { name: "companyName", label: "Company/Website Name", type: "text", required: false },
                  { name: "companyWebsite", label: "Primary Website URL *", type: "url", required: true },
                  { name: "industry", label: "Industry/Niche *", type: "text", required: true },
                  { name: "targetAudience", label: "Target Audience", type: "text", required: false },
                  { name: "currentDomainAuthority", label: "Current Domain Authority (if known)", type: "number", required: false },
                  { name: "monthlyTraffic", label: "Monthly Website Traffic", type: "text", required: false },
                  { name: "mainCompetitors", label: "Main Competitors", type: "text", required: false },
                  { name: "seoGoals", label: "Primary SEO Goals", type: "text", required: false },
                ].map((field) => (
                  <div key={field.name}>
                    <label className="block font-medium capitalize mb-1">
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    <input
                      type={field.type}
                      name={field.name}
                      value={userData[field.name] || ""}
                      onChange={handleInputChange}
                      className={`border p-2 rounded w-full focus:outline-none focus:ring-2 ${
                        field.required 
                          ? 'border-blue-300 focus:ring-blue-400 focus:border-blue-500' 
                          : 'border-gray-300 focus:ring-blue-400'
                      }`}
                      placeholder={`Enter ${field.label.replace(' *', '').toLowerCase()}`}
                      required={field.required}
                    />
                  </div>
                ))}
              </div>

              <div className="mb-6">
                <label className="block font-medium mb-1">Content Marketing Budget (Monthly):</label>
                <select
                  name="monthlyBudget"
                  value={userData.monthlyBudget || ""}
                  onChange={handleInputChange}
                  className="border border-gray-300 p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <option value="">Select budget range</option>
                  <option value="500-1000">$500 - $1,000</option>
                  <option value="1000-2500">$1,000 - $2,500</option>
                  <option value="2500-5000">$2,500 - $5,000</option>
                  <option value="5000-10000">$5,000 - $10,000</option>
                  <option value="10000+">$10,000+</option>
                </select>
              </div>

              <div className="mb-6">
                <label className="block font-medium mb-1">SEO Experience Level:</label>
                <select
                  name="seoExperience"
                  value={userData.seoExperience || ""}
                  onChange={handleInputChange}
                  className="border border-gray-300 p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <option value="">Select experience level</option>
                  <option value="beginner">Beginner - New to SEO</option>
                  <option value="intermediate">Intermediate - Some SEO knowledge</option>
                  <option value="advanced">Advanced - Experienced with SEO</option>
                  <option value="expert">Expert - SEO Professional</option>
                </select>
              </div>

              <button
                type="button"
                onClick={handleSubmitUserData}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 w-full"
              >
                Complete SEO Profile
              </button>
            </form>
          </div>
        ) : (
          <div>
            {/* Header with role-based title */}
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {userDetails?.role === 'Owner' || userDetails?.role === 'Admin' ? 'SEO Agency Dashboard' : 'SEO Dashboard'}
                </h1>
                <p className="text-gray-600 mt-1">
                  {userDetails?.role === 'Owner' && "Manage your SEO agency operations and client accounts"}
                  {userDetails?.role === 'Admin' && "Oversee all SEO activities and team performance"}
                  {userDetails?.role === 'Agency' && "Handle client SEO campaigns and content"}
                  {userDetails?.role === 'Client' && "Track your website's SEO progress and content"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Welcome back,</p>
                <p className="text-lg font-semibold text-gray-900">{firstName}</p>
              </div>
            </div>

            {/* Key Metrics Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* SEO Accounts Card */}
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">SEO Accounts</p>
                    <p className="text-3xl font-bold">{formatNumber(dashboardStats?.seoAccountsCount || stats.totalAccounts || 0)}</p>
                    <p className="text-blue-100 text-sm mt-1">
                      {userDetails?.role === 'Owner' || userDetails?.role === 'Admin' ? 'Total clients' : 'Active campaigns'}
                    </p>
                  </div>
                  <div className="bg-blue-400 bg-opacity-50 p-3 rounded-lg">
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Content Performance */}
              <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-medium">Published Content</p>
                    <p className="text-3xl font-bold">{formatNumber(dashboardStats?.totalBlogPosts || stats.totalBlogs || 0)}</p>
                    <p className="text-green-100 text-sm mt-1">Total blog posts</p>
                  </div>
                  <div className="bg-green-400 bg-opacity-50 p-3 rounded-lg">
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Backlinks */}
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-xl text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm font-medium">Total Backlinks</p>
                    <p className="text-3xl font-bold">{formatNumber(dashboardStats?.totalBacklinks || stats.totalBacklinks || 0)}</p>
                    <p className="text-purple-100 text-sm mt-1">All backlinks</p>
                  </div>
                  <div className="bg-purple-400 bg-opacity-50 p-3 rounded-lg">
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Monthly Revenue/Performance */}
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-xl text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm font-medium">
                      {userDetails?.role === 'Owner' || userDetails?.role === 'Admin' ? 'Monthly Revenue' : 'SEO Score'}
                    </p>
                    <p className="text-3xl font-bold">
                      {userDetails?.role === 'Owner' || userDetails?.role === 'Admin' 
                        ? formatCurrency(dashboardStats?.monthlyRevenue || 0)
                        : (stats.avgDomainAuthority || 78)
                      }
                    </p>
                    <p className="text-orange-100 text-sm mt-1">
                      {userDetails?.role === 'Owner' || userDetails?.role === 'Admin' ? 'This month' : 'Average score'}
                    </p>
                  </div>
                  <div className="bg-orange-400 bg-opacity-50 p-3 rounded-lg">
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* User Management Stats (for Admin/Owner roles) */}
            {(userDetails?.role === 'Owner' || userDetails?.role === 'Admin') && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Total Agencies</h3>
                  <p className="text-3xl font-bold text-blue-600">{formatNumber(dashboardStats?.totalAgencies || stats.totalAgencies || 0)}</p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Total Clients</h3>
                  <p className="text-3xl font-bold text-green-600">{formatNumber(dashboardStats?.totalClients || stats.totalClients || 0)}</p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Active Users</h3>
                  <p className="text-3xl font-bold text-purple-600">{formatNumber(dashboardStats?.activeUsers || stats.activeUsers || 0)}</p>
                  <p className="text-sm text-gray-600 mt-1">Last 30 days</p>
                </div>
              </div>
            )}

            {/* Quick Actions Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
              {/* Quick Actions */}
              <div className="lg:col-span-2">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Hide SEO Accounts for Client users */}
                  {userDetails?.role !== 'Client' && (
                    <Link 
                      to="/seo-accounts" 
                      className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 group"
                    >
                      <div className="flex items-center mb-3">
                        <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 00-2 2H8a2 2 0 00-2-2V6m8 0h2a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2h2" />
                          </svg>
                        </div>
                        <h4 className="text-md font-semibold text-gray-900 ml-3">
                          {userDetails?.role === 'Owner' || userDetails?.role === 'Admin' ? 'Manage SEO Accounts' : 'View SEO Accounts'}
                        </h4>
                      </div>
                      <p className="text-sm text-gray-600">
                        {userDetails?.role === 'Owner' || userDetails?.role === 'Admin' 
                          ? 'Add new clients, manage existing accounts, and track campaign performance' 
                          : 'Monitor your SEO campaigns and view progress reports'}
                      </p>
                    </Link>
                  )}

                  <Link 
                    to="/blog-posts" 
                    className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 group"
                  >
                    <div className="flex items-center mb-3">
                      <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <h4 className="text-md font-semibold text-gray-900 ml-3">
                        {userDetails?.role === 'Owner' || userDetails?.role === 'Admin' ? 'Create Content' : 'View Content'}
                      </h4>
                    </div>
                    <p className="text-sm text-gray-600">
                      {userDetails?.role === 'Owner' || userDetails?.role === 'Admin' 
                        ? 'Write new blog posts, manage content calendar, and publish articles' 
                        : 'View your published content and upcoming blog posts'}
                    </p>
                  </Link>

                  <Link 
                    to="/backlinks" 
                    className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 group"
                  >
                    <div className="flex items-center mb-3">
                      <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                        <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                      </div>
                      <h4 className="text-md font-semibold text-gray-900 ml-3">
                        {userDetails?.role === 'Owner' || userDetails?.role === 'Admin' ? 'Manage Backlinks' : 'View Backlinks'}
                      </h4>
                    </div>
                    <p className="text-sm text-gray-600">
                      {userDetails?.role === 'Owner' || userDetails?.role === 'Admin' 
                        ? 'Track backlink campaigns, monitor link quality, and build authority' 
                        : 'See your backlink profile and link building progress'}
                    </p>
                  </Link>

                  {(userDetails?.role === 'Owner' || userDetails?.role === 'Admin') && (
                    <Link 
                      to="/analytics" 
                      className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 group"
                    >
                      <div className="flex items-center mb-3">
                        <div className="p-2 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors">
                          <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2-2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                        </div>
                        <h4 className="text-md font-semibold text-gray-900 ml-3">View Analytics</h4>
                      </div>
                      <p className="text-sm text-gray-600">
                        Access detailed reports, performance metrics, and client insights
                      </p>
                    </Link>
                  )}
                </div>
              </div>

              {/* Recent Activity */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="space-y-4">
                    {recentActivity && recentActivity.length > 0 ? (
                      recentActivity.map((activity, index) => (
                        <div key={index} className="flex items-start space-x-3">
                          <div className={`w-2 h-2 rounded-full mt-2 ${
                            activity.type === 'blog_post' ? 'bg-green-500' :
                            activity.type === 'backlink' ? 'bg-blue-500' :
                            activity.type === 'user_registration' ? 'bg-purple-500' :
                            'bg-gray-500'
                          }`}></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                            <p className="text-xs text-gray-500">{activity.user} - {getTimeAgo(activity.timestamp)}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <>
                        <div className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">New blog post published</p>
                            <p className="text-xs text-gray-500">TechCorp Solutions - 2 hours ago</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">Backlink acquired</p>
                            <p className="text-xs text-gray-500">High authority site - 4 hours ago</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">SEO audit completed</p>
                            <p className="text-xs text-gray-500">Green Leaf Wellness - 1 day ago</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">New client onboarded</p>
                            <p className="text-xs text-gray-500">RetailPro Inc - 2 days ago</p>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                  <Link to="/analytics" className="block mt-4 text-sm text-blue-600 hover:text-blue-800 font-medium">
                    View all activity →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoggedInPage;
