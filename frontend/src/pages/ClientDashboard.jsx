import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/authContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import {
  GlobeIcon,
  DocumentTextIcon,
  ChartBarIcon,
  CalendarIcon,
  EyeIcon,
  LogoutIcon,
  UserIcon
} from '@heroicons/react/outline';

const ClientDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [seoAccount, setSeoAccount] = useState(null);
  const [blogPosts, setBlogPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBlogPost, setSelectedBlogPost] = useState(null);

  useEffect(() => {
    if (!user || user.role !== 'Client') {
      navigate('/login');
      return;
    }
    fetchClientData();
  }, [user, navigate]);

  const fetchClientData = async () => {
    try {
      // Fetch SEO account for this client - cookies will be sent automatically
      const accountResponse = await axios.get('/api/seo-accounts');
      
      // Find the account where this client is the clientUserId
      const clientAccount = accountResponse.data.seoAccounts?.find(
        account => account.clientUserId === user.id
      );
      
      if (clientAccount) {
        setSeoAccount(clientAccount);
        
        // Fetch blog posts for this account - cookies will be sent automatically
        const blogResponse = await axios.get(`/api/blog-posts?seoAccountId=${clientAccount._id}`);
        setBlogPosts(blogResponse.data.blogPosts || []);
      }
    } catch (error) {
      console.error('Error fetching client data:', error);
      toast.error('Failed to load account information');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'review': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!seoAccount) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full mx-4 text-center">
          <div className="text-gray-400 mb-4">
            <GlobeIcon className="h-16 w-16 mx-auto" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No SEO Account Found</h2>
          <p className="text-gray-600 mb-6">
            You don't have access to any SEO accounts yet. Please contact your agency for more information.
          </p>
          <button
            onClick={handleLogout}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <GlobeIcon className="h-8 w-8 text-blue-500 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">SEO Dashboard</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-sm text-gray-700">
                <UserIcon className="h-4 w-4 mr-1" />
                {user.firstName} {user.lastName}
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center text-gray-500 hover:text-gray-700 text-sm"
              >
                <LogoutIcon className="h-4 w-4 mr-1" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Account Overview */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Account Overview</h2>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
              Active
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center p-4 bg-blue-50 rounded-lg">
              <GlobeIcon className="h-8 w-8 text-blue-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-blue-700">Website</p>
                <p className="text-lg font-semibold text-blue-900">{seoAccount.domain}</p>
              </div>
            </div>
            
            <div className="flex items-center p-4 bg-green-50 rounded-lg">
              <ChartBarIcon className="h-8 w-8 text-green-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-green-700">Niche</p>
                <p className="text-lg font-semibold text-green-900">{seoAccount.niche}</p>
              </div>
            </div>
            
            <div className="flex items-center p-4 bg-purple-50 rounded-lg">
              <DocumentTextIcon className="h-8 w-8 text-purple-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-purple-700">Blog Posts</p>
                <p className="text-lg font-semibold text-purple-900">{blogPosts.length}</p>
              </div>
            </div>
          </div>

          {seoAccount.targetKeywords && seoAccount.targetKeywords.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Target Keywords</h3>
              <div className="flex flex-wrap gap-2">
                {seoAccount.targetKeywords.map((keyword, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Blog Posts */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Blog Posts</h2>
            <span className="text-sm text-gray-500">{blogPosts.length} total posts</span>
          </div>

          {blogPosts.length === 0 ? (
            <div className="text-center py-12">
              <DocumentTextIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Blog Posts Yet</h3>
              <p className="text-gray-600">Your SEO team will start creating content for your website soon.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {blogPosts.map((post) => (
                <div
                  key={post._id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{post.title}</h3>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{post.metaDescription}</p>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <CalendarIcon className="h-4 w-4 mr-1" />
                          {formatDate(post.createdAt)}
                        </div>
                        
                        {post.targetKeywords && post.targetKeywords.length > 0 && (
                          <div className="flex items-center">
                            <span className="mr-1">Keywords:</span>
                            <span className="font-medium">{post.targetKeywords.slice(0, 2).join(', ')}</span>
                            {post.targetKeywords.length > 2 && (
                              <span className="ml-1">+{post.targetKeywords.length - 2} more</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 ml-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(post.status)}`}>
                        {post.status}
                      </span>
                      <button
                        onClick={() => setSelectedBlogPost(post)}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Blog Post Modal */}
      {selectedBlogPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">{selectedBlogPost.title}</h2>
                <button
                  onClick={() => setSelectedBlogPost(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedBlogPost.status)}`}>
                  {selectedBlogPost.status}
                </span>
                <span>{formatDate(selectedBlogPost.createdAt)}</span>
              </div>
            </div>
            
            <div className="p-6">
              {selectedBlogPost.metaDescription && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-700">{selectedBlogPost.metaDescription}</p>
                </div>
              )}
              
              <div className="prose max-w-none">
                <div dangerouslySetInnerHTML={{ __html: selectedBlogPost.content }} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientDashboard;
