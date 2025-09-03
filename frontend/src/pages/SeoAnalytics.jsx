import React, { useState, useEffect, useRef } from "react";
import Nav from "../components/Chat/Nav";
import { useAuth } from "../context/authContext";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, PointElement, LineElement } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { FaUsers, FaUserTie, FaFileAlt, FaMoneyBillWave, FaChartBar, FaCog } from 'react-icons/fa';
import ProfileMenu from "../components/ProfileMenu";

// Register ChartJS components
ChartJS.register(
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  PointElement, 
  LineElement
);

const SeoAnalytics = () => {
  const { user } = useAuth();
  
  const [agencies, setAgencies] = useState([]);
  const [seoAccounts, setSeoAccounts] = useState([]);
  const [blogPosts, setBlogPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState("month");
  const [monthlyRate, setMonthlyRate] = useState(100); // Default $100 per agency per month
  const [showRateModal, setShowRateModal] = useState(false);
  const [tempRate, setTempRate] = useState(100);
  
  // Chart refs
  const agencyChartRef = useRef(null);
  const accountsChartRef = useRef(null);
  const articlesChartRef = useRef(null);
  const revenueChartRef = useRef(null);

  useEffect(() => {
    fetchAllData();
  }, [timeFilter]);

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        fetchAgencies(),
        fetchSeoAccounts(),
        fetchBlogPosts()
      ]);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load some data");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAgencies = async () => {
    try {
      const response = await axios.get("/api/user/agencies");
      setAgencies(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching agencies:", error);
      setAgencies([]);
    }
  };

  const fetchSeoAccounts = async () => {
    try {
      const response = await axios.get("/api/seo-accounts");
      setSeoAccounts(Array.isArray(response.data.seoAccounts) ? response.data.seoAccounts : []);
    } catch (error) {
      console.error("Error fetching SEO accounts:", error);
      setSeoAccounts([]);
    }
  };

  const fetchBlogPosts = async () => {
    try {
      const response = await axios.get("/api/blog-posts");
      setBlogPosts(Array.isArray(response.data.blogPosts) ? response.data.blogPosts : []);
    } catch (error) {
      console.error("Error fetching blog posts:", error);
      setBlogPosts([]);
    }
  };

  // Get time filter start date
  const getTimeFilterStartDate = (filter) => {
    const now = new Date();
    
    switch (filter) {
      case 'today':
        return new Date(now.setHours(0, 0, 0, 0));
      case 'week':
        const firstDayOfWeek = new Date(now);
        firstDayOfWeek.setDate(now.getDate() - now.getDay());
        firstDayOfWeek.setHours(0, 0, 0, 0);
        return firstDayOfWeek;
      case 'month':
        return new Date(now.getFullYear(), now.getMonth(), 1);
      case 'quarter':
        const quarterMonth = Math.floor(now.getMonth() / 3) * 3;
        return new Date(now.getFullYear(), quarterMonth, 1);
      case 'year':
        return new Date(now.getFullYear(), 0, 1);
      default:
        return null;
    }
  };

  // Calculate SEO metrics
  const calculateSeoMetrics = () => {
    const startDate = getTimeFilterStartDate(timeFilter);
    
    // Filter data by time period
    const filteredAccounts = startDate 
      ? seoAccounts.filter(account => new Date(account.createdAt) >= startDate)
      : seoAccounts;
      
    const filteredBlogPosts = startDate
      ? blogPosts.filter(post => new Date(post.createdAt) >= startDate)
      : blogPosts;

    // Agency statistics
    const totalAgencies = agencies.length;
    const activeAgencies = agencies.filter(agency => agency.role === 'Agency').length;
    
    // Client statistics
    const clientAccounts = seoAccounts.filter(account => account.clientUserId);
    const totalClients = clientAccounts.length;
    
    // SEO Account statistics
    const totalSeoAccounts = seoAccounts.length;
    const newAccountsThisPeriod = filteredAccounts.length;
    
    // Account status breakdown
    const accountsByStatus = seoAccounts.reduce((acc, account) => {
      const status = account.status || 'active';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});
    
    // Blog post statistics
    const totalBlogPosts = blogPosts.length;
    const newBlogPostsThisPeriod = filteredBlogPosts.length;
    
    // Blog posts by agency
    const blogPostsByAgency = {};
    blogPosts.forEach(post => {
      if (post.seoAccountId && post.seoAccountId.assignedAgency) {
        const agencyId = post.seoAccountId.assignedAgency._id || post.seoAccountId.assignedAgency;
        const agencyName = agencies.find(a => a._id === agencyId)?.companyName || 
                          agencies.find(a => a._id === agencyId)?.firstName + ' ' + 
                          agencies.find(a => a._id === agencyId)?.lastName || 
                          'Unknown Agency';
        blogPostsByAgency[agencyName] = (blogPostsByAgency[agencyName] || 0) + 1;
      }
    });
    
    // SEO accounts by agency
    const accountsByAgency = {};
    seoAccounts.forEach(account => {
      if (account.assignedAgency) {
        const agencyId = account.assignedAgency._id || account.assignedAgency;
        const agencyName = agencies.find(a => a._id === agencyId)?.companyName || 
                          agencies.find(a => a._id === agencyId)?.firstName + ' ' + 
                          agencies.find(a => a._id === agencyId)?.lastName || 
                          'Unknown Agency';
        accountsByAgency[agencyName] = (accountsByAgency[agencyName] || 0) + 1;
      }
    });
    
    // Revenue calculations
    const monthlyRevenue = activeAgencies * monthlyRate;
    const projectedYearlyRevenue = monthlyRevenue * 12;
    
    return {
      totalAgencies,
      activeAgencies,
      totalClients,
      totalSeoAccounts,
      newAccountsThisPeriod,
      accountsByStatus,
      totalBlogPosts,
      newBlogPostsThisPeriod,
      blogPostsByAgency,
      accountsByAgency,
      monthlyRevenue,
      projectedYearlyRevenue
    };
  };

  // Time filtering label
  const getTimeFilterLabel = () => {
    switch(timeFilter) {
      case 'today': return 'Today';
      case 'week': return 'This Week';
      case 'month': return 'This Month';
      case 'quarter': return 'This Quarter';
      case 'year': return 'This Year';
      default: return 'All Time';
    }
  };

  // Chart data preparations
  const prepareAgencyAccountsChart = () => {
    const metrics = calculateSeoMetrics();
    const agencies = Object.keys(metrics.accountsByAgency);
    const counts = agencies.map(agency => metrics.accountsByAgency[agency]);
    
    const backgroundColors = [
      'rgba(54, 162, 235, 0.6)',
      'rgba(75, 192, 192, 0.6)',
      'rgba(153, 102, 255, 0.6)',
      'rgba(255, 159, 64, 0.6)',
      'rgba(255, 99, 132, 0.6)',
      'rgba(255, 206, 86, 0.6)',
    ];
    
    return {
      labels: agencies,
      datasets: [{
        label: 'SEO Accounts by Agency',
        data: counts,
        backgroundColor: backgroundColors.slice(0, agencies.length),
        borderWidth: 1
      }]
    };
  };

  const prepareAccountStatusChart = () => {
    const metrics = calculateSeoMetrics();
    const statuses = Object.keys(metrics.accountsByStatus);
    const counts = statuses.map(status => metrics.accountsByStatus[status]);
    
    const statusColors = {
      'active': 'rgba(75, 192, 92, 0.6)',
      'paused': 'rgba(255, 206, 86, 0.6)',
      'completed': 'rgba(54, 162, 235, 0.6)',
      'cancelled': 'rgba(255, 99, 132, 0.6)'
    };
    
    const backgroundColors = statuses.map(status => 
      statusColors[status] || 'rgba(201, 203, 207, 0.6)'
    );
    
    return {
      labels: statuses.map(s => s.charAt(0).toUpperCase() + s.slice(1)),
      datasets: [{
        label: 'Accounts by Status',
        data: counts,
        backgroundColor: backgroundColors,
        borderWidth: 1
      }]
    };
  };

  const prepareBlogPostsChart = () => {
    const metrics = calculateSeoMetrics();
    const agencies = Object.keys(metrics.blogPostsByAgency);
    const counts = agencies.map(agency => metrics.blogPostsByAgency[agency]);
    
    const backgroundColors = [
      'rgba(153, 102, 255, 0.6)',
      'rgba(255, 159, 64, 0.6)',
      'rgba(54, 162, 235, 0.6)',
      'rgba(75, 192, 192, 0.6)',
      'rgba(255, 99, 132, 0.6)',
      'rgba(255, 206, 86, 0.6)',
    ];
    
    return {
      labels: agencies,
      datasets: [{
        label: 'Blog Posts by Agency',
        data: counts,
        backgroundColor: backgroundColors.slice(0, agencies.length),
        borderWidth: 1
      }]
    };
  };

  const prepareRevenueChart = () => {
    const metrics = calculateSeoMetrics();
    
    return {
      labels: ['Monthly Revenue', 'Projected Yearly'],
      datasets: [{
        label: 'Revenue (USD)',
        data: [metrics.monthlyRevenue, metrics.projectedYearlyRevenue],
        backgroundColor: [
          'rgba(75, 192, 92, 0.6)',
          'rgba(54, 162, 235, 0.6)'
        ],
        borderWidth: 1
      }]
    };
  };

  // Handle rate update
  const handleUpdateRate = () => {
    setMonthlyRate(tempRate);
    setShowRateModal(false);
    toast.success(`Monthly rate updated to $${tempRate} per agency`);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Nav />
        <div className="flex-1 flex items-center justify-center ml-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  const metrics = calculateSeoMetrics();

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Nav />
      <div className="flex-1 p-6 ml-64">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">SEO Agency Analytics Dashboard</h1>
            <p className="text-gray-600">Monitor your SEO agencies performance and revenue</p>
          </div>
          
          <div className="flex space-x-2">
            {/* Time Filter Buttons */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 inline-flex">
              <button 
                onClick={() => setTimeFilter('today')}
                className={`px-3 py-1 text-sm rounded-l-lg ${timeFilter === 'today' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700'}`}
              >
                Today
              </button>
              <button 
                onClick={() => setTimeFilter('week')}
                className={`px-3 py-1 text-sm ${timeFilter === 'week' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700'}`}
              >
                This Week
              </button>
              <button 
                onClick={() => setTimeFilter('month')}
                className={`px-3 py-1 text-sm ${timeFilter === 'month' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700'}`}
              >
                This Month
              </button>
              <button 
                onClick={() => setTimeFilter('quarter')}
                className={`px-3 py-1 text-sm ${timeFilter === 'quarter' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700'}`}
              >
                This Quarter
              </button>
              <button 
                onClick={() => setTimeFilter('year')}
                className={`px-3 py-1 text-sm ${timeFilter === 'year' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700'}`}
              >
                This Year
              </button>
              <button 
                onClick={() => setTimeFilter('all')}
                className={`px-3 py-1 text-sm rounded-r-lg ${timeFilter === 'all' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700'}`}
              >
                All Time
              </button>
            </div>
            
            {/* Settings Button for Admin */}
            {(user?.role === 'Admin' || user?.role === 'Owner') && (
              <button 
                onClick={() => {
                  setTempRate(monthlyRate);
                  setShowRateModal(true);
                }}
                className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                <FaCog className="mr-2" />
                Settings
              </button>
            )}
          </div>
        </div>
        
        {/* KPI Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center mb-2">
              <div className="p-3 rounded-full bg-blue-100 mr-4">
                <FaUsers className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-700">Total Agencies</h3>
                <p className="text-3xl font-bold text-gray-800">{metrics.totalAgencies}</p>
                <p className="text-sm text-gray-500 mt-1">{metrics.activeAgencies} active</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center mb-2">
              <div className="p-3 rounded-full bg-green-100 mr-4">
                <FaUserTie className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-700">SEO Accounts</h3>
                <p className="text-3xl font-bold text-gray-800">{metrics.totalSeoAccounts}</p>
                <p className="text-sm text-gray-500 mt-1">{metrics.newAccountsThisPeriod} new {getTimeFilterLabel().toLowerCase()}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center mb-2">
              <div className="p-3 rounded-full bg-purple-100 mr-4">
                <FaFileAlt className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-700">Blog Posts</h3>
                <p className="text-3xl font-bold text-gray-800">{metrics.totalBlogPosts}</p>
                <p className="text-sm text-gray-500 mt-1">{metrics.newBlogPostsThisPeriod} new {getTimeFilterLabel().toLowerCase()}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center mb-2">
              <div className="p-3 rounded-full bg-yellow-100 mr-4">
                <FaMoneyBillWave className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-700">Monthly Revenue</h3>
                <p className="text-3xl font-bold text-gray-800">${metrics.monthlyRevenue}</p>
                <p className="text-sm text-gray-500 mt-1">${monthlyRate}/agency/month</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Charts - First Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* SEO Accounts by Agency */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">SEO Accounts by Agency</h3>
            <div ref={agencyChartRef} className="h-80">
              <Bar 
                data={prepareAgencyAccountsChart()} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true
                    }
                  }
                }}
              />
            </div>
          </div>
          
          {/* Account Status Distribution */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Account Status Distribution</h3>
            <div ref={accountsChartRef} className="h-80">
              <Pie 
                data={prepareAccountStatusChart()}
                options={{
                  responsive: true,
                  maintainAspectRatio: false
                }}
              />
            </div>
          </div>
        </div>
        
        {/* Charts - Second Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Blog Posts by Agency */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Blog Posts by Agency</h3>
            <div ref={articlesChartRef} className="h-80">
              <Bar 
                data={prepareBlogPostsChart()}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true
                    }
                  }
                }}
              />
            </div>
          </div>
          
          {/* Revenue Overview */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Revenue Overview</h3>
            <div ref={revenueChartRef} className="h-80">
              <Bar 
                data={prepareRevenueChart()}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        callback: function(value) {
                          return '$' + value.toLocaleString();
                        }
                      }
                    }
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Rate Settings Modal */}
      {showRateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-lg font-semibold mb-4">Update Monthly Rate per Agency</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Monthly Rate (USD)
              </label>
              <input
                type="number"
                value={tempRate}
                onChange={(e) => setTempRate(Number(e.target.value))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter rate per agency per month"
              />
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleUpdateRate}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
              >
                Update Rate
              </button>
              <button
                onClick={() => setShowRateModal(false)}
                className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SeoAnalytics;
