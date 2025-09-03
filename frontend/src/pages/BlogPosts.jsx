import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/authContext';
import { toast } from 'react-hot-toast';
import { blogPostsAPI, seoAccountsAPI } from '../services/api';
import Nav from '../components/Chat/Nav';
import ProfileMenu from '../components/ProfileMenu';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const BlogPosts = () => {
  const { user } = useAuth();
  const [fetchLoading, setFetchLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [seoAccounts, setSeoAccounts] = useState([]);
  const [selectedSeoAccount, setSelectedSeoAccount] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewPost, setPreviewPost] = useState(null);
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    author: '',
    category: 'general',
    tags: [],
    keywords: [],
    status: 'draft',
    scheduledDate: '',
    targetKeyword: '',
    seoAccountId: ''
  });
  const [editPost, setEditPost] = useState({
    title: '',
    content: '',
    author: '',
    category: 'general',
    tags: [],
    keywords: [],
    status: 'draft',
    scheduledDate: '',
    targetKeyword: '',
    seoAccountId: ''
  });
  const [newTagInput, setNewTagInput] = useState('');
  const [newKeywordInput, setNewKeywordInput] = useState('');
  const [editTagInput, setEditTagInput] = useState('');
  const [editKeywordInput, setEditKeywordInput] = useState('');

  // Format date helper function
  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Tag management functions
  const addTag = (tagValue, isEdit = false) => {
    const trimmedTag = tagValue.trim();
    if (trimmedTag && trimmedTag.length > 0) {
      if (isEdit) {
        if (!editPost.tags.includes(trimmedTag)) {
          setEditPost({...editPost, tags: [...editPost.tags, trimmedTag]});
        }
        setEditTagInput('');
      } else {
        if (!newPost.tags.includes(trimmedTag)) {
          setNewPost({...newPost, tags: [...newPost.tags, trimmedTag]});
        }
        setNewTagInput('');
      }
    }
  };

  const removeTag = (tagToRemove, isEdit = false) => {
    if (isEdit) {
      setEditPost({...editPost, tags: editPost.tags.filter(tag => tag !== tagToRemove)});
    } else {
      setNewPost({...newPost, tags: newPost.tags.filter(tag => tag !== tagToRemove)});
    }
  };

  const handleTagKeyPress = (e, isEdit = false) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag(isEdit ? editTagInput : newTagInput, isEdit);
    }
  };

  // Keyword management functions
  const addKeyword = (keywordValue, isEdit = false) => {
    const trimmedKeyword = keywordValue.trim();
    if (trimmedKeyword && trimmedKeyword.length > 0) {
      if (isEdit) {
        if (!editPost.keywords.includes(trimmedKeyword)) {
          setEditPost({...editPost, keywords: [...editPost.keywords, trimmedKeyword]});
        }
        setEditKeywordInput('');
      } else {
        if (!newPost.keywords.includes(trimmedKeyword)) {
          setNewPost({...newPost, keywords: [...newPost.keywords, trimmedKeyword]});
        }
        setNewKeywordInput('');
      }
    }
  };

  const removeKeyword = (keywordToRemove, isEdit = false) => {
    if (isEdit) {
      setEditPost({...editPost, keywords: editPost.keywords.filter(keyword => keyword !== keywordToRemove)});
    } else {
      setNewPost({...newPost, keywords: newPost.keywords.filter(keyword => keyword !== keywordToRemove)});
    }
  };

  const handleKeywordKeyPress = (e, isEdit = false) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addKeyword(isEdit ? editKeywordInput : newKeywordInput, isEdit);
    }
  };

  // Fetch posts and SEO accounts on component mount
  useEffect(() => {
    fetchPosts();
    fetchSeoAccounts();
  }, []);

  const fetchSeoAccounts = async () => {
    try {
      // Use the existing seoAccountsAPI service
      const response = await seoAccountsAPI.getAll();
      // Backend returns { seoAccounts: [...], pagination: {...} }
      const accountsData = response.data.seoAccounts || response.data.accounts || response.data || [];
      console.log('Fetched SEO accounts:', accountsData); // Debug log
      console.log('SEO accounts data type:', typeof accountsData, 'Is array:', Array.isArray(accountsData)); // Debug log
      setSeoAccounts(Array.isArray(accountsData) ? accountsData : []);
      
      // Auto-select the first SEO account if there's only one and none is selected
      if (Array.isArray(accountsData) && accountsData.length === 1 && !newPost.seoAccountId) {
        console.log('Auto-selecting single SEO account:', accountsData[0]._id);
        setNewPost(prev => ({ ...prev, seoAccountId: accountsData[0]._id }));
      }
    } catch (error) {
      console.error('Error fetching SEO accounts:', error);
      console.error('Error response:', error.response?.data); // Additional debug info
      setSeoAccounts([]);
    }
  };

  const fetchPosts = async () => {
    try {
      setFetchLoading(true);
      const response = await blogPostsAPI.getAll();
      // Backend returns { message: "...", blogPosts: [...] }
      const blogPosts = response.data.blogPosts || response.data || [];
      setPosts(Array.isArray(blogPosts) ? blogPosts : []);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast.error('Failed to load blog posts');
      // Ensure posts remains an array even on error
      setPosts([]);
    } finally {
      setFetchLoading(false);
    }
  };

  // Calculate dynamic stats (filtered if SEO account is selected)
  const filteredPosts = selectedSeoAccount 
    ? posts.filter(post => post.seoAccount?._id === selectedSeoAccount)
    : posts;
  
  const totalPosts = Array.isArray(filteredPosts) ? filteredPosts.length : 0;
  const publishedPosts = Array.isArray(filteredPosts) ? filteredPosts.filter(post => post.status === 'published').length : 0;
  const draftPosts = Array.isArray(filteredPosts) ? filteredPosts.filter(post => post.status === 'draft').length : 0;
  const scheduledPosts = Array.isArray(filteredPosts) ? filteredPosts.filter(post => post.status === 'scheduled').length : 0;

  const handleCreatePost = () => {
    // Fetch SEO accounts when opening the form to ensure fresh data
    fetchSeoAccounts();
    setShowCreateForm(true);
  };

  const handleSavePost = async () => {
    // Validate required fields
    if (!newPost.title.trim()) {
      toast.error('Post title is required');
      return;
    }
    
    if (!newPost.targetKeyword.trim()) {
      toast.error('Target keyword is required');
      return;
    }

    if (!newPost.content.trim()) {
      toast.error('Post content is required');
      return;
    }

    if (!newPost.seoAccountId) {
      toast.error('Please select an SEO account for this blog post');
      return;
    }

    setFetchLoading(true);
    
    try {
      // Prepare data for API
      const postData = {
        title: newPost.title,
        content: newPost.content,
        author: newPost.author || (user ? `${user.firstName} ${user.lastName}` : 'Anonymous'),
        category: newPost.category,
        tags: newPost.tags, // Already an array
        keywords: newPost.keywords, // Already an array
        status: newPost.status,
        targetKeyword: newPost.targetKeyword,
        scheduledDate: newPost.scheduledDate || null,
        seoAccountId: newPost.seoAccountId || null,
        slug: newPost.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      };
      
      const response = await blogPostsAPI.create(postData);
      
      // Backend returns { message: "...", blogPost: {...} }
      const newBlogPost = response.data.blogPost || response.data;
      setPosts(prevPosts => [...prevPosts, newBlogPost]);
      
      // Also refresh the entire list to ensure consistency
      fetchPosts();
      
      toast.success(`Blog post "${newPost.title}" has been created successfully!`);
      setShowCreateForm(false);
      setNewPost({ 
        title: '', 
        content: '', 
        author: '',
        category: 'general',
        tags: [],
        keywords: [],
        status: 'draft',
        scheduledDate: '',
        targetKeyword: '',
        seoAccountId: ''
      });
      setNewTagInput('');
      setNewKeywordInput('');
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error(error.response?.data?.message || 'Failed to create post. Please try again.');
    } finally {
      setFetchLoading(false);
    }
  };

  const handleUpdatePost = async () => {
    // Validate required fields
    if (!editPost.title.trim()) {
      toast.error('Post title is required');
      return;
    }
    if (!editPost.content.trim()) {
      toast.error('Post content is required');
      return;
    }

    try {
      setFetchLoading(true);
      
      const postData = {
        title: editPost.title,
        content: editPost.content,
        author: editPost.author,
        tags: editPost.tags, // Already an array
        keywords: editPost.keywords, // Already an array
        category: editPost.category,
        status: editPost.status,
        targetKeyword: editPost.targetKeyword,
        scheduledDate: editPost.scheduledDate || null,
        seoAccountId: editPost.seoAccountId || null,
        slug: editPost.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      };
      
      const response = await blogPostsAPI.update(editingPost._id, postData);
      
      // Update the post in the posts array
      const updatedPost = response.data.blogPost || response.data;
      setPosts(prevPosts => 
        prevPosts.map(post => 
          post._id === editingPost._id ? updatedPost : post
        )
      );
      
      // Also refresh the entire list to ensure consistency
      fetchPosts();
      
      toast.success(`Blog post "${editPost.title}" has been updated successfully!`);
      setShowEditForm(false);
      setEditPost({ 
        title: '', 
        content: '', 
        author: '',
        category: 'general',
        tags: [],
        keywords: [],
        status: 'draft',
        scheduledDate: '',
        targetKeyword: '',
        seoAccountId: ''
      });
      setEditingPost(null);
      setEditTagInput('');
      setEditKeywordInput('');
      setEditingPost(null);
    } catch (error) {
      console.error('Error updating post:', error);
      toast.error(error.response?.data?.message || 'Failed to update post. Please try again.');
    } finally {
      setFetchLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowCreateForm(false);
    setShowEditForm(false);
    setNewPost({ 
      title: '', 
      content: '', 
      author: '',
      category: 'general',
      tags: [],
      keywords: [],
      status: 'draft',
      scheduledDate: '',
      targetKeyword: '',
      seoAccountId: ''
    });
    setEditPost({ 
      title: '', 
      content: '', 
      author: '',
      category: 'general',
      tags: [],
      keywords: [],
      status: 'draft',
      scheduledDate: '',
      targetKeyword: '',
      seoAccountId: ''
    });
    setEditingPost(null);
    setNewTagInput('');
    setNewKeywordInput('');
    setEditTagInput('');
    setEditKeywordInput('');
  };

  const handleDeletePost = async (postId) => {
    if (window.confirm('Are you sure you want to delete this blog post?')) {
      try {
        await blogPostsAPI.delete(postId);
        setPosts(prevPosts => prevPosts.filter(post => post._id !== postId));
        toast.success('Blog post deleted successfully');
      } catch (error) {
        console.error('Error deleting post:', error);
        toast.error('Failed to delete blog post');
      }
    }
  };

  const handleEditPost = (postId) => {
    // Find the post to edit
    const postToEdit = posts.find(post => post._id === postId);
    if (postToEdit) {
      // Populate the edit form with existing data
      setEditPost({
        title: postToEdit.title || '',
        content: postToEdit.content || '',
        author: postToEdit.author || '',
        category: postToEdit.category || 'general',
        tags: Array.isArray(postToEdit.tags) ? postToEdit.tags : (postToEdit.tags ? postToEdit.tags.split(',').map(tag => tag.trim()) : []),
        keywords: Array.isArray(postToEdit.keywords) ? postToEdit.keywords : (postToEdit.keywords ? postToEdit.keywords.split(',').map(keyword => keyword.trim()) : []),
        status: postToEdit.status || 'draft',
        scheduledDate: postToEdit.scheduledDate || '',
        targetKeyword: postToEdit.targetKeyword || '',
        seoAccountId: postToEdit.seoAccount?._id || ''
      });
      setEditingPost(postToEdit);
      setShowEditForm(true);
      // Fetch SEO accounts when opening the form
      fetchSeoAccounts();
    } else {
      toast.error('Post not found');
    }
  };

  const handleViewPost = (postId) => {
    // Navigate to view page or open view modal
    // For now, just show a message
    toast.info('View functionality will be implemented next');
  };

  const handlePreviewPost = (post) => {
    setPreviewPost(post);
    setShowPreviewModal(true);
  };

  const handleCopyPost = async (post) => {
    try {
      // Strip HTML tags from content for plain text copy
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = post.content;
      const plainText = tempDiv.textContent || tempDiv.innerText || '';
      
      const contentToCopy = `${post.title}\n\n${plainText}`;
      
      await navigator.clipboard.writeText(contentToCopy);
      toast.success('Blog post copied to clipboard!');
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      toast.error('Failed to copy to clipboard');
    }
  };

  const handleDownloadDocx = async (post) => {
    try {
      // Create a simple Word document content
      const docContent = `
        ${post.title}
        
        ${post.content.replace(/<[^>]*>/g, '')} // Strip HTML tags
        
        ---
        Category: ${post.category || 'N/A'}
        Target Keyword: ${post.targetKeyword || 'N/A'}
        Status: ${post.status || 'draft'}
        Created: ${formatDate(post.createdAt)}
      `;
      
      // Create a blob with the content
      const blob = new Blob([docContent], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${post.slug || post.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Blog post downloaded!');
    } catch (error) {
      console.error('Error downloading post:', error);
      toast.error('Failed to download post');
    }
  };

  return (
    <div className="flex">
      <Nav />
      <div className="ml-64 p-8 min-h-screen bg-gray-50 flex-1">
      <div className="max-w-7xl mx-auto relative">
        <ProfileMenu />
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Blog Posts</h1>
          <p className="text-gray-600 mt-2">Manage your SEO blog content and publishing workflow</p>
        </div>

        {/* Filter Indicator */}
        {selectedSeoAccount && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
              </svg>
              <span className="text-blue-800 font-medium">
                Filtering by: {seoAccounts.find(acc => acc._id === selectedSeoAccount)?.accountName || 'Unknown Account'}
              </span>
            </div>
            <button
              onClick={() => setSelectedSeoAccount(null)}
              className="text-blue-600 hover:text-blue-800 font-medium text-sm"
            >
              Clear Filter
            </button>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Posts</p>
                <p className="text-2xl font-bold text-gray-900">{totalPosts}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Published</p>
                <p className="text-2xl font-bold text-gray-900">{publishedPosts}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Draft</p>
                <p className="text-2xl font-bold text-gray-900">{draftPosts}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Scheduled</p>
                <p className="text-2xl font-bold text-gray-900">{scheduledPosts}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex space-x-4">
            {/* Hide Create New Post button for Client users */}
            {user?.role !== 'Client' && (
              <>
                <button 
                  onClick={handleCreatePost}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  + Create New Post
                </button>
                <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors">
                  Bulk Import
                </button>
              </>
            )}
          </div>
          
          <div className="flex space-x-2">
            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option>All Status</option>
              <option>Published</option>
              <option>Draft</option>
              <option>Scheduled</option>
            </select>
            <input 
              type="text" 
              placeholder="Search posts..." 
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button className="bg-gray-100 p-2 rounded-lg hover:bg-gray-200">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Blog Posts Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Blog Posts</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Account
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Target Keywords
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Published Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {fetchLoading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                      Loading blog posts...
                    </td>
                  </tr>
                ) : !Array.isArray(posts) || posts.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                      No blog posts found. {user?.role === 'Client' ? 'Contact your agency to create posts.' : 'Click "Create New Post" to get started.'}
                    </td>
                  </tr>
                ) : (
                  (() => {
                    // Filter posts by selected SEO account
                    const filteredPosts = selectedSeoAccount 
                      ? posts.filter(post => post.seoAccount?._id === selectedSeoAccount)
                      : posts;
                    
                    return filteredPosts.map((post) => {
                      // Status styling
                      const statusColors = {
                        published: 'bg-green-100 text-green-800',
                        draft: 'bg-yellow-100 text-yellow-800',
                        scheduled: 'bg-blue-100 text-blue-800',
                        'under-review': 'bg-purple-100 text-purple-800'
                      };
                    
                    // Calculate word count
                    const wordCount = post.content ? post.content.replace(/<[^>]*>/g, '').split(/\s+/).filter(word => word.length > 0).length : 0;
                    
                    return (
                      <tr key={post._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {post.title}
                            </div>
                            <div className="text-sm text-gray-500">
                              {wordCount} words
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div 
                            className="cursor-pointer hover:bg-blue-50 p-2 rounded-md transition-colors"
                            onClick={() => setSelectedSeoAccount(post.seoAccount?._id || null)}
                          >
                            <div className="text-sm font-medium text-blue-600 hover:text-blue-800">
                              {post.seoAccount?.accountName || 'General Account'}
                            </div>
                            <div className="text-sm text-gray-500">{post.seoAccount?.domain || 'example.com'}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[post.status] || statusColors.draft}`}>
                            {post.status ? post.status.charAt(0).toUpperCase() + post.status.slice(1).replace('-', ' ') : 'Draft'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{post.targetKeyword || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(post.publishedAt || post.scheduledAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            {/* View/Preview Button (Eye Icon) */}
                            <button 
                              onClick={() => handlePreviewPost(post)}
                              className="text-blue-600 hover:text-blue-900 p-1"
                              title="Preview Post"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                            
                            {/* Edit Button - Only for Admin/Agency */}
                            {(user?.role === 'Admin' || user?.role === 'Agency') && (
                              <button 
                                onClick={() => handleEditPost(post._id)}
                                className="text-yellow-600 hover:text-yellow-900 p-1"
                                title="Edit Post"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                            )}
                            
                            {/* Delete Button - Only for Admin/Agency */}
                            {(user?.role === 'Admin' || user?.role === 'Agency') && (
                              <button 
                                onClick={() => handleDeletePost(post._id)}
                                className="text-red-600 hover:text-red-900 p-1"
                                title="Delete Post"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  });
                })()
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Create Post Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Create New Blog Post</h3>
            </div>
            
            <div className="px-6 py-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Post Title
                  </label>
                  <input
                    type="text"
                    value={newPost.title}
                    onChange={(e) => setNewPost({...newPost, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter post title"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Author
                  </label>
                  <input
                    type="text"
                    value={newPost.author}
                    onChange={(e) => setNewPost({...newPost, author: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Author name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Target Keyword
                  </label>
                  <input
                    type="text"
                    value={newPost.targetKeyword}
                    onChange={(e) => setNewPost({...newPost, targetKeyword: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter target keyword"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={newPost.category}
                    onChange={(e) => setNewPost({...newPost, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="general">General</option>
                    <option value="tutorial">Tutorial</option>
                    <option value="news">News</option>
                    <option value="review">Review</option>
                    <option value="guide">Guide</option>
                    <option value="seo">SEO</option>
                    <option value="marketing">Marketing</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SEO Account ({seoAccounts.length} available)
                  </label>
                  <select
                    value={newPost.seoAccountId}
                    onChange={(e) => setNewPost({...newPost, seoAccountId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select SEO Account</option>
                    {seoAccounts.length > 0 ? (
                      seoAccounts.map((account) => (
                        <option key={account._id} value={account._id}>
                          {account.accountName} ({account.domain})
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>No SEO accounts found - Check console for debug info</option>
                    )}
                  </select>
                  {/* Debug info */}
                  <div className="text-xs text-gray-500 mt-1">
                    Debug: {seoAccounts.length} accounts loaded, Array: {Array.isArray(seoAccounts).toString()}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={newPost.status}
                    onChange={(e) => setNewPost({...newPost, status: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="draft">Draft</option>
                    <option value="in_review">In Review</option>
                    <option value="approved">Approved</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="published">Published</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tags
                  </label>
                  <div className="w-full">
                    {/* Display existing tags as chips */}
                    <div className="flex flex-wrap gap-2 mb-2">
                      {newPost.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800 border border-blue-200"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="ml-2 text-blue-600 hover:text-blue-800 focus:outline-none"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                    {/* Input for new tags */}
                    <input
                      type="text"
                      value={newTagInput}
                      onChange={(e) => setNewTagInput(e.target.value)}
                      onKeyPress={handleTagKeyPress}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Type a tag and press Enter"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Keywords
                  </label>
                  <div className="w-full">
                    {/* Display existing keywords as chips */}
                    <div className="flex flex-wrap gap-2 mb-2">
                      {newPost.keywords.map((keyword, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800 border border-green-200"
                        >
                          {keyword}
                          <button
                            type="button"
                            onClick={() => removeKeyword(keyword)}
                            className="ml-2 text-green-600 hover:text-green-800 focus:outline-none"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                    {/* Input for new keywords */}
                    <input
                      type="text"
                      value={newKeywordInput}
                      onChange={(e) => setNewKeywordInput(e.target.value)}
                      onKeyPress={handleKeywordKeyPress}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Type a keyword and press Enter"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Scheduled Date
                  </label>
                  <input
                    type="datetime-local"
                    value={newPost.scheduledDate}
                    onChange={(e) => setNewPost({...newPost, scheduledDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Content
                </label>
                <div className="border border-gray-300 rounded-md">
                  <ReactQuill
                    theme="snow"
                    value={newPost.content}
                    onChange={(content) => setNewPost({...newPost, content})}
                    modules={{
                      toolbar: [
                        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                        ['bold', 'italic', 'underline', 'strike'],
                        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                        [{ 'script': 'sub'}, { 'script': 'super' }],
                        [{ 'indent': '-1'}, { 'indent': '+1' }],
                        [{ 'direction': 'rtl' }],
                        [{ 'color': [] }, { 'background': [] }],
                        [{ 'align': [] }],
                        ['link', 'image', 'video'],
                        ['blockquote', 'code-block'],
                        ['clean']
                      ],
                    }}
                    formats={[
                      'header', 'bold', 'italic', 'underline', 'strike',
                      'list', 'bullet', 'script', 'indent', 'direction',
                      'color', 'background', 'align', 'link', 'image', 'video',
                      'blockquote', 'code-block'
                    ]}
                    style={{ minHeight: '300px' }}
                    placeholder="Write your blog post content here..."
                  />
                </div>
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={handleCloseModal}
                disabled={fetchLoading}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePost}
                disabled={fetchLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {fetchLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating...
                  </>
                ) : (
                  'Create Post'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Post Modal */}
      {showEditForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Edit Blog Post</h3>
            </div>
            
            <div className="px-6 py-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Post Title
                  </label>
                  <input
                    type="text"
                    value={editPost.title}
                    onChange={(e) => setEditPost({...editPost, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter post title"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Author
                  </label>
                  <input
                    type="text"
                    value={editPost.author}
                    onChange={(e) => setEditPost({...editPost, author: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Author name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Target Keyword
                  </label>
                  <input
                    type="text"
                    value={editPost.targetKeyword}
                    onChange={(e) => setEditPost({...editPost, targetKeyword: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter target keyword"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={editPost.category}
                    onChange={(e) => setEditPost({...editPost, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="general">General</option>
                    <option value="tutorial">Tutorial</option>
                    <option value="news">News</option>
                    <option value="review">Review</option>
                    <option value="guide">Guide</option>
                    <option value="seo">SEO</option>
                    <option value="marketing">Marketing</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SEO Account ({seoAccounts.length} available)
                  </label>
                  <select
                    value={editPost.seoAccountId}
                    onChange={(e) => setEditPost({...editPost, seoAccountId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select SEO Account</option>
                    {seoAccounts.length > 0 ? (
                      seoAccounts.map((account) => (
                        <option key={account._id} value={account._id}>
                          {account.accountName} ({account.domain})
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>No SEO accounts found</option>
                    )}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={editPost.status}
                    onChange={(e) => setEditPost({...editPost, status: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="draft">Draft</option>
                    <option value="in_review">In Review</option>
                    <option value="approved">Approved</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="published">Published</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Scheduled Date (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    value={editPost.scheduledDate}
                    onChange={(e) => setEditPost({...editPost, scheduledDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tags
                  </label>
                  <div className="w-full">
                    {/* Display existing tags as chips */}
                    <div className="flex flex-wrap gap-2 mb-2">
                      {editPost.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800 border border-blue-200"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag, true)}
                            className="ml-2 text-blue-600 hover:text-blue-800 focus:outline-none"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                    {/* Input for new tags */}
                    <input
                      type="text"
                      value={editTagInput}
                      onChange={(e) => setEditTagInput(e.target.value)}
                      onKeyPress={(e) => handleTagKeyPress(e, true)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Type a tag and press Enter"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Keywords
                  </label>
                  <div className="w-full">
                    {/* Display existing keywords as chips */}
                    <div className="flex flex-wrap gap-2 mb-2">
                      {editPost.keywords.map((keyword, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800 border border-green-200"
                        >
                          {keyword}
                          <button
                            type="button"
                            onClick={() => removeKeyword(keyword, true)}
                            className="ml-2 text-green-600 hover:text-green-800 focus:outline-none"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                    {/* Input for new keywords */}
                    <input
                      type="text"
                      value={editKeywordInput}
                      onChange={(e) => setEditKeywordInput(e.target.value)}
                      onKeyPress={(e) => handleKeywordKeyPress(e, true)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Type a keyword and press Enter"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Content
                </label>
                <ReactQuill
                  value={editPost.content}
                  onChange={(content) => setEditPost({...editPost, content})}
                  modules={{
                    toolbar: [
                      [{ 'header': [1, 2, 3, false] }],
                      ['bold', 'italic', 'underline', 'strike'],
                      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                      ['link', 'image'],
                      ['clean']
                    ],
                  }}
                  style={{ height: '300px', marginBottom: '50px' }}
                />
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdatePost}
                disabled={fetchLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 disabled:opacity-50"
              >
                {fetchLoading ? 'Updating...' : 'Update Post'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Preview Modal */}
      {showPreviewModal && previewPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Preview: {previewPost.title}</h3>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="px-6 py-4">
              {/* Post Meta Information */}
              <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Category:</span>
                  <span className="ml-2 text-gray-600">{previewPost.category || 'N/A'}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Status:</span>
                  <span className="ml-2 text-gray-600">{previewPost.status || 'draft'}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Target Keyword:</span>
                  <span className="ml-2 text-gray-600">{previewPost.targetKeyword || 'N/A'}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Created:</span>
                  <span className="ml-2 text-gray-600">{formatDate(previewPost.createdAt)}</span>
                </div>
              </div>
              
              {/* Post Content */}
              <div className="prose max-w-none">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">{previewPost.title}</h1>
                <div 
                  className="text-gray-700 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: previewPost.content }}
                />
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              {/* Copy Button */}
              <button
                onClick={() => handleCopyPost(previewPost)}
                className="px-4 py-2 text-sm font-medium text-purple-700 bg-purple-100 border border-purple-300 rounded-md hover:bg-purple-200 transition-colors"
              >
                <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy
              </button>
              
              {/* Download Button */}
              <button
                onClick={() => handleDownloadDocx(previewPost)}
                className="px-4 py-2 text-sm font-medium text-green-700 bg-green-100 border border-green-300 rounded-md hover:bg-green-200 transition-colors"
              >
                <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download
              </button>
              
              <button
                onClick={() => setShowPreviewModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  );
};

export default BlogPosts;
