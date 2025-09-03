import React, { useState, useEffect } from "react";
import Nav from "../components/Chat/Nav";
import { useProfile } from "../context/profileContext";
import { useAuth } from "../context/authContext";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import { 
  EyeIcon,
  PencilIcon, 
  TrashIcon, 
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ExternalLinkIcon,
  SearchIcon,
  FilterIcon,
  ChatAltIcon,
  DocumentTextIcon
} from "@heroicons/react/outline";
import ProfileMenu from "../components/ProfileMenu";

const statusStyles = {
  "Draft": "bg-gray-100 text-gray-600",
  "Under Review": "bg-yellow-100 text-yellow-600", 
  "Approved": "bg-green-100 text-green-600",
  "Rejected": "bg-red-100 text-red-600",
  "Published": "bg-blue-100 text-blue-600",
  "Needs Revision": "bg-orange-100 text-orange-600"
};

const BlogPostsPage = () => {
  const { userDetails } = useProfile();
  const { user } = useAuth();
  const [blogPosts, setBlogPosts] = useState([]);
  const [seoAccounts, setSeoAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [accountFilter, setAccountFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedPost, setSelectedPost] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewData, setReviewData] = useState({ action: "", notes: "" });

  useEffect(() => {
    fetchBlogPosts();
    fetchSeoAccounts();
  }, [currentPage, statusFilter, accountFilter]);

  const fetchBlogPosts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: 12
      });
      
      if (statusFilter) params.append("status", statusFilter);
      if (accountFilter) params.append("seoAccountId", accountFilter);

      const response = await axios.get(`/api/blog-posts?${params}`);
      setBlogPosts(response.data.blogPosts);
      setTotalPages(response.data.pagination.pages);
    } catch (error) {
      console.error("Error fetching blog posts:", error);
      toast.error("Failed to fetch blog posts");
    } finally {
      setLoading(false);
    }
  };

  const fetchSeoAccounts = async () => {
    try {
      const response = await axios.get("/api/seo-accounts");
      setSeoAccounts(response.data);
    } catch (error) {
      console.error("Error fetching SEO accounts:", error);
    }
  };

  const handleReview = async (postId, action, notes = "") => {
    try {
      await axios.post(`/api/blog-posts/${postId}/review`, {
        action,
        notes
      });
      toast.success(`Blog post ${action}d successfully`);
      fetchBlogPosts();
      setShowReviewModal(false);
      setSelectedPost(null);
      setReviewData({ action: "", notes: "" });
    } catch (error) {
      console.error("Error reviewing blog post:", error);
      toast.error(error.response?.data?.message || "Failed to review blog post");
    }
  };

  const handlePublish = async (postId, publishedUrl) => {
    try {
      await axios.post(`/api/blog-posts/${postId}/publish`, {
        publishedUrl
      });
      toast.success("Blog post published successfully");
      fetchBlogPosts();
    } catch (error) {
      console.error("Error publishing blog post:", error);
      toast.error(error.response?.data?.message || "Failed to publish blog post");
    }
  };

  const handleDelete = async (postId) => {
    if (window.confirm("Are you sure you want to delete this blog post?")) {
      try {
        await axios.delete(`/api/blog-posts/${postId}`);
        toast.success("Blog post deleted successfully");
        fetchBlogPosts();
      } catch (error) {
        console.error("Error deleting blog post:", error);
        toast.error("Failed to delete blog post");
      }
    }
  };

  const filteredPosts = blogPosts.filter(post =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.seoAccountId?.accountName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openReviewModal = (post, action) => {
    setSelectedPost(post);
    setReviewData({ action, notes: "" });
    setShowReviewModal(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const canReview = user?.role === "Agency";
  const canPublish = user?.role === "Admin";
  const canEdit = user?.role === "Admin";

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#FAFBFF]">
        <Nav />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="loader border-t-4 border-blue-500 rounded-full w-12 h-12 animate-spin mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading blog posts...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#FAFBFF]">
      <Nav />
      
      <div className="flex-1 flex flex-col p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Blog Posts</h1>
            <p className="text-gray-600">
              {user?.role === "Admin" && "Create and manage blog content"}
              {user?.role === "Agency" && "Review and approve blog posts"}
              {user?.role === "Client" && "View your approved blog content"}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            {canEdit && (
              <Link
                to="/blog-editor"
                className="flex items-center gap-2 bg-[#00FFA6] text-white px-4 py-2 rounded-lg hover:bg-[#16A34A] transition"
              >
                <DocumentTextIcon className="w-5 h-5" />
                Create Blog Post
              </Link>
            )}
            <ProfileMenu />
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search blog posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="Draft">Draft</option>
            <option value="Under Review">Under Review</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
            <option value="Published">Published</option>
            <option value="Needs Revision">Needs Revision</option>
          </select>

          <select
            value={accountFilter}
            onChange={(e) => setAccountFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Accounts</option>
            {seoAccounts.map((account) => (
              <option key={account._id} value={account._id}>
                {account.accountName}
              </option>
            ))}
          </select>
        </div>

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post) => (
            <div key={post._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {/* Featured Image */}
              {post.featuredImage && (
                <div className="h-48 bg-gray-200 overflow-hidden">
                  <img
                    src={post.featuredImage}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="p-6">
                {/* Status and Account */}
                <div className="flex items-center justify-between mb-3">
                  <span className={`px-2 py-1 text-xs rounded-full ${statusStyles[post.status]}`}>
                    {post.status}
                  </span>
                  <span className="text-xs text-gray-500">
                    {post.seoAccountId?.accountName}
                  </span>
                </div>

                {/* Title and Excerpt */}
                <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
                  {post.title}
                </h3>
                
                {post.excerpt && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>
                )}

                {/* Meta Info */}
                <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                  <span>{post.wordCount} words</span>
                  <span>{post.readTime} min read</span>
                  <span>{formatDate(post.createdAt)}</span>
                </div>

                {/* Keywords */}
                {post.targetKeywords && post.targetKeywords.length > 0 && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                      {post.targetKeywords.slice(0, 2).map((keyword, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded">
                          {keyword}
                        </span>
                      ))}
                      {post.targetKeywords.length > 2 && (
                        <span className="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded">
                          +{post.targetKeywords.length - 2} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/blog-posts/${post._id}`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <EyeIcon className="w-4 h-4" />
                    </Link>

                    {canEdit && post.status !== "Published" && (
                      <Link
                        to={`/blog-editor/${post._id}`}
                        className="text-green-600 hover:text-green-800"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </Link>
                    )}

                    {canEdit && (
                      <button
                        onClick={() => handleDelete(post._id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Review Actions for Agency */}
                    {canReview && post.status === "Under Review" && (
                      <>
                        <button
                          onClick={() => openReviewModal(post, "approve")}
                          className="text-green-600 hover:text-green-800"
                          title="Approve"
                        >
                          <CheckCircleIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openReviewModal(post, "reject")}
                          className="text-red-600 hover:text-red-800"
                          title="Reject"
                        >
                          <XCircleIcon className="w-4 h-4" />
                        </button>
                      </>
                    )}

                    {/* Publish Action for Admin */}
                    {canPublish && post.status === "Approved" && (
                      <button
                        onClick={() => {
                          const url = prompt("Enter the published URL:");
                          if (url) {
                            handlePublish(post._id, url);
                          }
                        }}
                        className="text-blue-600 hover:text-blue-800"
                        title="Publish"
                      >
                        <ExternalLinkIcon className="w-4 h-4" />
                      </button>
                    )}

                    {/* Published URL */}
                    {post.status === "Published" && post.publishedUrl && (
                      <a
                        href={post.publishedUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                        title="View Published"
                      >
                        <ExternalLinkIcon className="w-4 h-4" />
                      </a>
                    )}

                    {/* Revision Notes Indicator */}
                    {post.revisionNotes && post.revisionNotes.length > 0 && (
                      <span className="text-orange-600" title="Has revision notes">
                        <ChatAltIcon className="w-4 h-4" />
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredPosts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <DocumentTextIcon className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-600 mb-2">No blog posts found</h3>
            <p className="text-gray-500">
              {searchTerm ? "Try adjusting your search terms." : "Get started by creating your first blog post."}
            </p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              
              <span className="px-4 py-2 text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {showReviewModal && selectedPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                {reviewData.action === "approve" ? "Approve" : "Reject"} Blog Post
              </h3>
              
              <p className="text-gray-600 mb-4">
                You are about to {reviewData.action} "<strong>{selectedPost.title}</strong>"
              </p>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {reviewData.action === "approve" ? "Approval Notes (Optional)" : "Rejection Reason"}
                </label>
                <textarea
                  value={reviewData.notes}
                  onChange={(e) => setReviewData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={4}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={
                    reviewData.action === "approve" 
                      ? "Add any approval notes..." 
                      : "Explain why this post needs revision..."
                  }
                  required={reviewData.action === "reject"}
                />
              </div>

              <div className="flex justify-end gap-4">
                <button
                  onClick={() => {
                    setShowReviewModal(false);
                    setSelectedPost(null);
                    setReviewData({ action: "", notes: "" });
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleReview(selectedPost._id, reviewData.action, reviewData.notes)}
                  className={`px-4 py-2 rounded-lg text-white ${
                    reviewData.action === "approve" 
                      ? "bg-green-600 hover:bg-green-700" 
                      : "bg-red-600 hover:bg-red-700"
                  }`}
                  disabled={reviewData.action === "reject" && !reviewData.notes.trim()}
                >
                  {reviewData.action === "approve" ? "Approve" : "Reject"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogPostsPage;
