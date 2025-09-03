import React, { useState, useEffect } from "react";
import Nav from "../components/Chat/Nav";
import { useProfile } from "../context/profileContext";
import { useAuth } from "../context/authContext";
import axios from "axios";
import { toast } from "react-hot-toast";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { 
  PlusCircleIcon, 
  PencilIcon, 
  TrashIcon, 
  ChevronDownIcon, 
  ChevronUpIcon,
  XIcon,
  SearchIcon,
  FilterIcon,
  GlobeIcon,
  UserGroupIcon,
  DocumentTextIcon,
  CalendarIcon,
  EyeIcon
} from "@heroicons/react/outline";
import ProfileMenu from "../components/ProfileMenu";

const SeoAccountsPage = () => {
  const { userDetails } = useProfile();
  const { user } = useAuth();
  const [seoAccounts, setSeoAccounts] = useState([]);
  const [agencies, setAgencies] = useState([]);
  const [clients, setClients] = useState([]);
  const [formVisible, setFormVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    accountName: "",
    domain: "",
    description: "",
    agencyId: "",
    clientId: "",
    requiresApproval: true,
    targetKeywords: "",
    monthlyBlogGoal: 4,
    contactEmail: "",
    contactPhone: "",
    brandColors: {
      primary: "#0066CC",
      secondary: "#00FFA6"
    }
  });
  const [editData, setEditData] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  
  // Blog posts modal state
  const [showBlogModal, setShowBlogModal] = useState(false);
  const [selectedAccountBlogs, setSelectedAccountBlogs] = useState([]);
  const [selectedAccountInfo, setSelectedAccountInfo] = useState(null);
  const [blogLoading, setBlogLoading] = useState(false);
  
  // Backlinks modal state
  const [showBacklinksModal, setShowBacklinksModal] = useState(false);
  const [selectedAccountBacklinks, setSelectedAccountBacklinks] = useState([]);
  const [backlinksLoading, setBacklinksLoading] = useState(false);
  
  // Blog detail modal state
  const [showBlogDetailModal, setShowBlogDetailModal] = useState(false);
  const [selectedBlogPost, setSelectedBlogPost] = useState(null);
  const [isEditingBlog, setIsEditingBlog] = useState(false);
  const [editBlogData, setEditBlogData] = useState({
    title: '',
    content: '',
    status: 'draft',
    tags: [],
    category: 'general'
  });

  useEffect(() => {
    fetchSeoAccounts();
    if (user?.role === "Admin") {
      fetchAgencies();
      fetchClients();
    }
  }, [user]);

  const fetchSeoAccounts = async () => {
    try {
      setLoading(true);
      // Use axios instance with withCredentials - cookies will be sent automatically
      const response = await axios.get("/api/seo-accounts");
      // Backend returns { seoAccounts: [...], pagination: {...} }
      const accountsData = response.data.seoAccounts || response.data.accounts || response.data;
      setSeoAccounts(Array.isArray(accountsData) ? accountsData : []);
    } catch (error) {
      console.error("Error fetching SEO accounts:", error);
      toast.error("Failed to fetch SEO accounts");
      // Set empty array on error
      setSeoAccounts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAgencies = async () => {
    try {
      const response = await axios.get("/api/user/agencies");
      // Ensure we always set an array
      setAgencies(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching agencies:", error);
      // Set empty array on error
      setAgencies([]);
    }
  };

  const fetchClients = async () => {
    try {
      const response = await axios.get("/api/user/clients");
      // Ensure we always set an array
      setClients(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching clients:", error);
      // Set empty array on error
      setClients([]);
    }
  };

  // Fetch blog posts for a specific SEO account
  const fetchAccountBlogPosts = async (accountId) => {
    try {
      setBlogLoading(true);
      const response = await axios.get("/api/blog-posts");
      // Backend returns { message: "...", blogPosts: [...] }
      const allBlogPosts = response.data.blogPosts || response.data || [];
      
      // Filter posts for this specific SEO account
      const accountPosts = allBlogPosts.filter(post => 
        post.seoAccount && post.seoAccount._id === accountId
      );
      
      setSelectedAccountBlogs(accountPosts);
    } catch (error) {
      console.error("Error fetching blog posts:", error);
      toast.error("Failed to fetch blog posts");
      setSelectedAccountBlogs([]);
    } finally {
      setBlogLoading(false);
    }
  };

  // Handle clicking on an SEO account to view its blog posts
  const handleViewAccountBlogs = (account) => {
    setSelectedAccountInfo(account);
    setShowBlogModal(true);
    fetchAccountBlogPosts(account._id);
  };

  // Close the blog posts modal
  const handleCloseBlogModal = () => {
    setShowBlogModal(false);
    setSelectedAccountBlogs([]);
    setSelectedAccountInfo(null);
  };

  // Fetch backlinks for a specific SEO account
  const fetchAccountBacklinks = async (accountId) => {
    try {
      setBacklinksLoading(true);
      const response = await axios.get(`/api/backlinks/seo-account/${accountId}`);
      setSelectedAccountBacklinks(response.data.backlinks || []);
    } catch (error) {
      console.error("Error fetching backlinks:", error);
      toast.error("Failed to fetch backlinks");
      setSelectedAccountBacklinks([]);
    } finally {
      setBacklinksLoading(false);
    }
  };

  // Handle clicking on an SEO account to view its backlinks
  const handleViewAccountBacklinks = (account) => {
    setSelectedAccountInfo(account);
    setShowBacklinksModal(true);
    fetchAccountBacklinks(account._id);
  };

  // Close the backlinks modal
  const handleCloseBacklinksModal = () => {
    setShowBacklinksModal(false);
    setSelectedAccountBacklinks([]);
    setSelectedAccountInfo(null);
  };

  // Format date helper
  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Blog detail modal functions
  const handleViewBlogDetail = (blogPost) => {
    setSelectedBlogPost(blogPost);
    setEditBlogData({
      title: blogPost.title || '',
      content: blogPost.content || '',
      status: blogPost.status || 'draft',
      tags: Array.isArray(blogPost.tags) ? blogPost.tags : [],
      category: blogPost.category || 'general'
    });
    setIsEditingBlog(false);
    setShowBlogDetailModal(true);
  };

  const handleCloseBlogDetail = () => {
    setShowBlogDetailModal(false);
    setSelectedBlogPost(null);
    setIsEditingBlog(false);
    setEditBlogData({
      title: '',
      content: '',
      status: 'draft',
      tags: [],
      category: 'general'
    });
  };

  const handleEditBlog = () => {
    setIsEditingBlog(true);
  };

  const handleCancelEditBlog = () => {
    setIsEditingBlog(false);
    setEditBlogData({
      title: selectedBlogPost.title || '',
      content: selectedBlogPost.content || '',
      status: selectedBlogPost.status || 'draft',
      tags: Array.isArray(selectedBlogPost.tags) ? selectedBlogPost.tags : [],
      category: selectedBlogPost.category || 'general'
    });
  };

  const handleSaveBlogEdit = async () => {
    try {
      const response = await axios.put(`/api/blog-posts/${selectedBlogPost._id}`, {
        title: editBlogData.title,
        content: editBlogData.content,
        status: editBlogData.status,
        tags: editBlogData.tags,
        category: editBlogData.category
      });

      // Update the blog post in the selected account blogs list
      setSelectedAccountBlogs(prevBlogs => 
        prevBlogs.map(blog => 
          blog._id === selectedBlogPost._id 
            ? { ...blog, ...editBlogData }
            : blog
        )
      );

      // Update the selected blog post
      setSelectedBlogPost({ ...selectedBlogPost, ...editBlogData });
      setIsEditingBlog(false);
      toast.success('Blog post updated successfully!');
    } catch (error) {
      console.error('Error updating blog post:', error);
      toast.error('Failed to update blog post');
    }
  };

  const handleDeleteBlog = async () => {
    if (window.confirm('Are you sure you want to delete this blog post? This action cannot be undone.')) {
      try {
        await axios.delete(`/api/blog-posts/${selectedBlogPost._id}`);
        
        // Remove the blog post from the selected account blogs list
        setSelectedAccountBlogs(prevBlogs => 
          prevBlogs.filter(blog => blog._id !== selectedBlogPost._id)
        );
        
        toast.success('Blog post deleted successfully!');
        handleCloseBlogDetail();
      } catch (error) {
        console.error('Error deleting blog post:', error);
        toast.error('Failed to delete blog post');
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Validate agencyId if provided
      const validAgencyId = formData.agencyId && formData.agencyId !== "" ? formData.agencyId : undefined;
      
      const submitData = {
        accountName: formData.accountName,
        domain: formData.domain,
        niche: formData.description, // Map description to niche
        targetKeywords: formData.targetKeywords.split(',').map(k => k.trim()).filter(k => k),
        contactEmail: formData.contactEmail,
        contactPhone: formData.contactPhone,
        requiresApproval: formData.requiresApproval,
        monthlyBudget: formData.monthlyBlogGoal * 100, // Estimate budget
        assignedAgency: validAgencyId
      };

      // Use axios instance with withCredentials - cookies will be sent automatically
      if (editData) {
        await axios.put(`/api/seo-accounts/${editData._id}`, submitData);
        toast.success("SEO account updated successfully");
      } else {
        await axios.post("/api/seo-accounts", submitData);
        toast.success("SEO account created successfully");
      }

      setFormVisible(false);
      setEditData(null);
      setFormData({
        accountName: "",
        domain: "",
        description: "",
        agencyId: "",
        clientId: "",
        requiresApproval: true,
        targetKeywords: "",
        monthlyBlogGoal: 4,
        contactEmail: "",
        contactPhone: "",
        brandColors: {
          primary: "#0066CC",
          secondary: "#00FFA6"
        }
      });
      fetchSeoAccounts();
    } catch (error) {
      console.error("Error saving SEO account:", error);
      toast.error(error.response?.data?.message || "Failed to save SEO account");
    }
  };

  const handleEdit = (account) => {
    setEditData(account);
    setFormData({
      accountName: account.accountName,
      domain: account.domain,
      description: account.description || "",
      agencyId: account.agencyId?._id || "",
      clientId: account.clientId?._id || "",
      requiresApproval: account.requiresApproval,
      targetKeywords: account.targetKeywords?.join(', ') || "",
      monthlyBlogGoal: account.monthlyBlogGoal || 4,
      contactEmail: account.contactEmail || "",
      contactPhone: account.contactPhone || "",
      brandColors: account.brandColors || {
        primary: "#0066CC",
        secondary: "#00FFA6"
      }
    });
    setFormVisible(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this SEO account?")) {
      try {
        await axios.delete(`/api/seo-accounts/${id}`);
        toast.success("SEO account deleted successfully");
        fetchSeoAccounts();
      } catch (error) {
        console.error("Error deleting SEO account:", error);
        toast.error("Failed to delete SEO account");
      }
    }
  };

  const filteredAccounts = Array.isArray(seoAccounts) ? seoAccounts.filter(account =>
    account.accountName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.domain.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#FAFBFF]">
        <Nav />
        <div className="flex-1 flex items-center justify-center ml-64">
          <div className="text-center">
            <div className="loader border-t-4 border-blue-500 rounded-full w-12 h-12 animate-spin mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading SEO accounts...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#FAFBFF]">
      <Nav />
      
      <div className="flex-1 flex flex-col p-6 ml-64">
        {/* Add left margin to account for fixed sidebar (w-64 = 256px = ml-64) */}
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">SEO Accounts</h1>
            <p className="text-gray-600">Manage your SEO client accounts and settings</p>
          </div>
          
          <div className="flex items-center gap-4">
            <ProfileMenu />
          </div>
        </div>

        {/* Search and Add Button */}
        <div className="flex items-center justify-between mb-6">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search accounts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {(user?.role === "Admin" || user?.role === "Agency" || user?.role === "Owner") && (
            <button
              onClick={() => {
                setFormVisible(true);
                setEditData(null);
                setFormData({
                  accountName: "",
                  domain: "",
                  description: "",
                  agencyId: "",
                  clientId: "",
                  requiresApproval: true,
                  targetKeywords: "",
                  monthlyBlogGoal: 4,
                  contactEmail: "",
                  contactPhone: "",
                  brandColors: {
                    primary: "#0066CC",
                    secondary: "#00FFA6"
                  }
                });
              }}
              className="flex items-center gap-2 bg-[#00FFA6] text-white px-4 py-2 rounded-lg hover:bg-[#16A34A] transition"
            >
              <PlusCircleIcon className="w-5 h-5" />
              Add SEO Account
            </button>
          )}
        </div>

        {/* SEO Accounts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAccounts.map((account) => (
            <div key={account._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: account.brandColors?.primary || "#0066CC" }}
                  ></div>
                  <h3 className="text-lg font-semibold text-gray-800">{account.accountName}</h3>
                </div>
                
                {(user?.role === "Admin" || user?.role === "Agency") && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleViewAccountBlogs(account)}
                      className="text-green-600 hover:text-green-800 p-2 rounded-md hover:bg-green-50"
                      title="View Blog Posts"
                    >
                      <DocumentTextIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleViewAccountBacklinks(account)}
                      className="text-purple-600 hover:text-purple-800 p-2 rounded-md hover:bg-purple-50"
                      title="View Backlinks"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleEdit(account)}
                      className="text-blue-600 hover:text-blue-800 p-2 rounded-md hover:bg-blue-50"
                      title="Edit Account"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    {user?.role === "Admin" && (
                      <button
                        onClick={() => handleDelete(account._id)}
                        className="text-red-600 hover:text-red-800 p-2 rounded-md hover:bg-red-50"
                        title="Delete Account"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-gray-600">
                  <GlobeIcon className="w-4 h-4" />
                  <span className="text-sm">{account.domain}</span>
                </div>

                {account.agencyId && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <UserGroupIcon className="w-4 h-4" />
                    <span className="text-sm">
                      {account.agencyId.companyName || `${account.agencyId.firstName} ${account.agencyId.lastName}`}
                    </span>
                  </div>
                )}

                {account.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">{account.description}</p>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    account.requiresApproval 
                      ? "bg-yellow-100 text-yellow-600" 
                      : "bg-green-100 text-green-600"
                  }`}>
                    {account.requiresApproval ? "Manual Approval" : "Auto Approval"}
                  </span>
                  
                  <span className="text-xs text-gray-500">
                    {account.monthlyBlogGoal || 4} blogs/month
                  </span>
                </div>

                {account.targetKeywords && account.targetKeywords.length > 0 && (
                  <div className="pt-2">
                    <div className="flex flex-wrap gap-1">
                      {account.targetKeywords.slice(0, 3).map((keyword, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded">
                          {keyword}
                        </span>
                      ))}
                      {account.targetKeywords.length > 3 && (
                        <span className="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded">
                          +{account.targetKeywords.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredAccounts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <GlobeIcon className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-600 mb-2">No SEO accounts found</h3>
            <p className="text-gray-500">
              {searchTerm ? "Try adjusting your search terms." : "Get started by creating your first SEO account."}
            </p>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {formVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">
                  {editData ? "Edit SEO Account" : "Create SEO Account"}
                </h2>
                <button
                  onClick={() => {
                    setFormVisible(false);
                    setEditData(null);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <XIcon className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Account Name *
                    </label>
                    <input
                      type="text"
                      name="accountName"
                      value={formData.accountName}
                      onChange={handleInputChange}
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter account name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Domain *
                    </label>
                    <input
                      type="text"
                      name="domain"
                      value={formData.domain}
                      onChange={handleInputChange}
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Brief description of the SEO account"
                  />
                </div>

                {user?.role === "Admin" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Agency *
                      </label>
                      <select
                        name="agencyId"
                        value={formData.agencyId}
                        onChange={handleInputChange}
                        required
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select an agency</option>
                        {agencies.map((agency) => (
                          <option key={agency._id} value={agency._id}>
                            {agency.companyName || `${agency.firstName} ${agency.lastName}`}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Client (Optional)
                      </label>
                      <input
                        type="text"
                        name="clientId"
                        value={formData.clientId}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter client name"
                      />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Target Keywords (comma separated)
                    </label>
                    <input
                      type="text"
                      name="targetKeywords"
                      value={formData.targetKeywords}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="SEO services, digital marketing, content writing"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Monthly Blog Goal
                    </label>
                    <input
                      type="number"
                      name="monthlyBlogGoal"
                      value={formData.monthlyBlogGoal}
                      onChange={handleInputChange}
                      min="1"
                      max="50"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Email
                    </label>
                    <input
                      type="email"
                      name="contactEmail"
                      value={formData.contactEmail}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="contact@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Phone
                    </label>
                    <input
                      type="tel"
                      name="contactPhone"
                      value={formData.contactPhone}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Primary Brand Color
                    </label>
                    <input
                      type="color"
                      name="brandColors.primary"
                      value={formData.brandColors.primary}
                      onChange={handleInputChange}
                      className="w-full h-12 border border-gray-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Secondary Brand Color
                    </label>
                    <input
                      type="color"
                      name="brandColors.secondary"
                      value={formData.brandColors.secondary}
                      onChange={handleInputChange}
                      className="w-full h-12 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="requiresApproval"
                    checked={formData.requiresApproval}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-700">
                    Require manual approval for blog posts
                  </label>
                </div>

                <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setFormVisible(false);
                      setEditData(null);
                    }}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-[#00FFA6] text-white rounded-lg hover:bg-[#16A34A] transition"
                  >
                    {editData ? "Update Account" : "Create Account"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Blog Posts Modal */}
      {showBlogModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h3 className="text-xl font-medium text-gray-900">
                  Blog Posts for {selectedAccountInfo?.accountName}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {selectedAccountInfo?.domain}
                </p>
              </div>
              <button
                onClick={handleCloseBlogModal}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <XIcon className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {blogLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-gray-600">Loading blog posts...</span>
                </div>
              ) : selectedAccountBlogs.length === 0 ? (
                <div className="text-center py-12">
                  <DocumentTextIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">
                    No Blog Posts Found
                  </h4>
                  <p className="text-gray-500">
                    This SEO account doesn't have any blog posts yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="text-lg font-medium text-gray-900">
                      {selectedAccountBlogs.length} Blog Post{selectedAccountBlogs.length !== 1 ? 's' : ''}
                    </h4>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        Published: {selectedAccountBlogs.filter(post => post.status === 'published').length}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                        Draft: {selectedAccountBlogs.filter(post => post.status === 'draft').length}
                      </span>
                    </div>
                  </div>
                  
                  {selectedAccountBlogs.map((post) => (
                    <div
                      key={post._id}
                      className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-gray-300 transition"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h5 className="font-medium text-gray-900 line-clamp-1">
                              {post.title}
                            </h5>
                            <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                              post.status === 'published' 
                                ? 'bg-green-100 text-green-800' 
                                : post.status === 'draft'
                                ? 'bg-yellow-100 text-yellow-800'
                                : post.status === 'scheduled'
                                ? 'bg-blue-100 text-blue-800'
                                : post.status === 'approved'
                                ? 'bg-emerald-100 text-emerald-800'
                                : post.status === 'in_review'
                                ? 'bg-orange-100 text-orange-800'
                                : post.status === 'rejected'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {post.status}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                            <div className="flex items-center gap-1">
                              <CalendarIcon className="w-4 h-4" />
                              <span>{formatDate(post.createdAt)}</span>
                            </div>
                            {post.author && (
                              <div className="flex items-center gap-1">
                                <span>by {typeof post.author === 'string' ? post.author : `${post.author.firstName} ${post.author.lastName}`}</span>
                              </div>
                            )}
                            {post.category && (
                              <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs">
                                {post.category}
                              </span>
                            )}
                          </div>
                          
                          {post.tags && post.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-3">
                              {post.tags.slice(0, 3).map((tag, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                                >
                                  {tag}
                                </span>
                              ))}
                              {post.tags.length > 3 && (
                                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                  +{post.tags.length - 3} more
                                </span>
                              )}
                            </div>
                          )}
                          
                          {post.content && (
                            <p className="text-sm text-gray-600 line-clamp-2">
                              {post.content.replace(/<[^>]*>/g, '').substring(0, 150)}...
                            </p>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2 ml-4">
                          <button
                            onClick={() => handleViewBlogDetail(post)}
                            className="text-blue-600 hover:text-blue-800 p-2 rounded-md hover:bg-blue-50"
                            title="View Blog Post"
                          >
                            <EyeIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {!blogLoading && selectedAccountBlogs.length > 0 && (
                <div className="mt-6 pt-4 border-t border-gray-200 text-center">
                  <button
                    onClick={() => {
                      window.location.href = `/blog-posts?seoAccount=${selectedAccountInfo._id}`;
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    View All in Blog Posts Manager
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Blog Detail Modal */}
      {showBlogDetailModal && selectedBlogPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[95vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex-1">
                {isEditingBlog ? (
                  <input
                    type="text"
                    value={editBlogData.title}
                    onChange={(e) => setEditBlogData({...editBlogData, title: e.target.value})}
                    className="text-xl font-semibold text-gray-900 w-full border-b border-gray-300 focus:border-blue-500 focus:outline-none"
                    placeholder="Blog post title..."
                  />
                ) : (
                  <h3 className="text-xl font-semibold text-gray-900">
                    {selectedBlogPost.title}
                  </h3>
                )}
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <CalendarIcon className="w-4 h-4" />
                    {formatDate(selectedBlogPost.createdAt)}
                  </span>
                  {selectedBlogPost.author && (
                    <span>
                      by {typeof selectedBlogPost.author === 'string' 
                        ? selectedBlogPost.author 
                        : `${selectedBlogPost.author.firstName} ${selectedBlogPost.author.lastName}`}
                    </span>
                  )}
                  {isEditingBlog ? (
                    <select
                      value={editBlogData.status}
                      onChange={(e) => setEditBlogData({...editBlogData, status: e.target.value})}
                      className="px-2 py-1 text-xs rounded border border-gray-300 focus:border-blue-500 focus:outline-none"
                    >
                      <option value="draft">Draft</option>
                      <option value="in_review">In Review</option>
                      <option value="approved">Approved</option>
                      <option value="scheduled">Scheduled</option>
                      <option value="published">Published</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  ) : (
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                      selectedBlogPost.status === 'published' 
                        ? 'bg-green-100 text-green-800' 
                        : selectedBlogPost.status === 'draft'
                        ? 'bg-yellow-100 text-yellow-800'
                        : selectedBlogPost.status === 'scheduled'
                        ? 'bg-blue-100 text-blue-800'
                        : selectedBlogPost.status === 'approved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : selectedBlogPost.status === 'in_review'
                        ? 'bg-orange-100 text-orange-800'
                        : selectedBlogPost.status === 'rejected'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedBlogPost.status}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2 ml-4">
                {isEditingBlog ? (
                  <>
                    <button
                      onClick={handleCancelEditBlog}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveBlogEdit}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Save
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleEditBlog}
                      className="text-blue-600 hover:text-blue-800 p-2 rounded-md hover:bg-blue-50"
                      title="Edit Blog Post"
                    >
                      <PencilIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleDeleteBlog}
                      className="text-red-600 hover:text-red-800 p-2 rounded-md hover:bg-red-50"
                      title="Delete Blog Post"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </>
                )}
                <button
                  onClick={handleCloseBlogDetail}
                  className="text-gray-400 hover:text-gray-600 p-2 rounded-md hover:bg-gray-50"
                >
                  <XIcon className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(95vh-140px)]">
              {/* Tags and Category Section */}
              <div className="flex flex-wrap items-center gap-4 mb-6 pb-4 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">Category:</span>
                  {isEditingBlog ? (
                    <select
                      value={editBlogData.category}
                      onChange={(e) => setEditBlogData({...editBlogData, category: e.target.value})}
                      className="px-2 py-1 text-sm border border-gray-300 rounded focus:border-blue-500 focus:outline-none"
                    >
                      <option value="general">General</option>
                      <option value="technology">Technology</option>
                      <option value="marketing">Marketing</option>
                      <option value="seo">SEO</option>
                    </select>
                  ) : (
                    <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-sm">
                      {selectedBlogPost.category || 'General'}
                    </span>
                  )}
                </div>
                
                {selectedBlogPost.tags && selectedBlogPost.tags.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">Tags:</span>
                    <div className="flex flex-wrap gap-1">
                      {selectedBlogPost.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedBlogPost.seoAccount && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">SEO Account:</span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-sm rounded">
                      {selectedBlogPost.seoAccount.accountName}
                    </span>
                  </div>
                )}
              </div>

              {/* Blog Content */}
              <div className="prose max-w-none">
                {isEditingBlog ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Content
                    </label>
                    <ReactQuill
                      theme="snow"
                      value={editBlogData.content}
                      onChange={(content) => setEditBlogData({...editBlogData, content})}
                      modules={{
                        toolbar: [
                          [{ 'header': [1, 2, 3, false] }],
                          ['bold', 'italic', 'underline', 'strike'],
                          ['blockquote', 'code-block'],
                          [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                          ['link', 'image'],
                          ['clean']
                        ],
                      }}
                      style={{ height: '300px', marginBottom: '50px' }}
                    />
                  </div>
                ) : (
                  <div 
                    className="blog-content"
                    dangerouslySetInnerHTML={{ __html: selectedBlogPost.content }}
                  />
                )}
              </div>

              {/* Blog Statistics */}
              {!isEditingBlog && (
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-lg font-semibold text-gray-900">
                        {selectedBlogPost.content ? selectedBlogPost.content.replace(/<[^>]*>/g, '').split(' ').length : 0}
                      </div>
                      <div className="text-sm text-gray-500">Words</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-lg font-semibold text-gray-900">
                        {selectedBlogPost.content ? selectedBlogPost.content.replace(/<[^>]*>/g, '').length : 0}
                      </div>
                      <div className="text-sm text-gray-500">Characters</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-lg font-semibold text-gray-900">
                        {selectedBlogPost.tags ? selectedBlogPost.tags.length : 0}
                      </div>
                      <div className="text-sm text-gray-500">Tags</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-lg font-semibold text-gray-900">
                        {formatDate(selectedBlogPost.updatedAt) !== formatDate(selectedBlogPost.createdAt) ? 'Yes' : 'No'}
                      </div>
                      <div className="text-sm text-gray-500">Modified</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Backlinks Modal */}
      {showBacklinksModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-6xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Backlinks for {selectedAccountInfo?.accountName}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Domain: {selectedAccountInfo?.domain}
                </p>
              </div>
              <button
                onClick={handleCloseBacklinksModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <XIcon className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {backlinksLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-gray-600">Loading backlinks...</span>
                </div>
              ) : selectedAccountBacklinks.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">No Backlinks Found</h4>
                  <p className="text-gray-500">This SEO account doesn't have any backlinks yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedAccountBacklinks.map((backlink) => (
                    <div key={backlink._id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-medium text-gray-900">{backlink.sourceDomain}</h4>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              backlink.status === 'live' ? 'bg-green-100 text-green-800' :
                              backlink.status === 'published' ? 'bg-blue-100 text-blue-800' :
                              backlink.status === 'prospecting' ? 'bg-yellow-100 text-yellow-800' :
                              backlink.status === 'outreach' ? 'bg-purple-100 text-purple-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {backlink.status.replace('_', ' ')}
                            </span>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              backlink.linkType === 'dofollow' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {backlink.linkType}
                            </span>
                          </div>
                          
                          <div className="text-sm text-gray-600 mb-2">
                            <strong>Anchor Text:</strong> {backlink.anchorText}
                          </div>
                          
                          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                            <div><strong>Source DA:</strong> {backlink.sourceDA || 'N/A'}</div>
                            <div><strong>Source DR:</strong> {backlink.sourceDR || 'N/A'}</div>
                            {backlink.cost && <div><strong>Cost:</strong> ${backlink.cost}</div>}
                            {backlink.campaign && <div><strong>Campaign:</strong> {backlink.campaign}</div>}
                          </div>
                          
                          <div className="mt-2 text-xs text-gray-400">
                            Created: {formatDate(backlink.createdAt)}
                            {backlink.publishedAt && ` • Published: ${formatDate(backlink.publishedAt)}`}
                          </div>
                        </div>
                        
                        <div className="flex flex-col gap-2">
                          <a
                            href={backlink.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            View Source
                          </a>
                          <a
                            href={backlink.targetUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-green-600 hover:text-green-800 text-sm"
                          >
                            View Target
                          </a>
                        </div>
                      </div>
                      
                      {backlink.notes && (
                        <div className="mt-3 p-3 bg-white rounded border border-gray-200">
                          <div className="text-sm text-gray-600">
                            <strong>Notes:</strong> {backlink.notes}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SeoAccountsPage;
