import React, { useState, useEffect, useRef } from "react";
import Nav from "../components/Chat/Nav";
import { useProfile } from "../context/profileContext";
import { useAuth } from "../context/authContext";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import { 
  SaveIcon,
  EyeIcon,
  XIcon,
  DocumentTextIcon,
  PhotographIcon,
  TagIcon,
  ClockIcon
} from "@heroicons/react/outline";
import ProfileMenu from "../components/ProfileMenu";

const BlogEditor = () => {
  const { userDetails } = useProfile();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const editorRef = useRef(null);
  
  const [seoAccounts, setSeoAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    excerpt: "",
    slug: "",
    metaTitle: "",
    metaDescription: "",
    targetKeywords: "",
    seoAccountId: "",
    featuredImage: "",
    scheduledPublishDate: "",
    isScheduled: false
  });
  const [wordCount, setWordCount] = useState(0);
  const [readTime, setReadTime] = useState(0);
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    if (user?.role !== "Admin") {
      navigate("/blog-posts");
      return;
    }
    
    fetchSeoAccounts();
    
    if (id) {
      fetchBlogPost();
    }
  }, [id, user, navigate]);

  useEffect(() => {
    calculateWordCount();
  }, [formData.content]);

  const fetchSeoAccounts = async () => {
    try {
      const response = await axios.get("/api/seo-accounts");
      setSeoAccounts(response.data);
    } catch (error) {
      console.error("Error fetching SEO accounts:", error);
      toast.error("Failed to fetch SEO accounts");
    }
  };

  const fetchBlogPost = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/blog-posts/${id}`);
      const post = response.data;
      
      setFormData({
        title: post.title || "",
        content: post.content || "",
        excerpt: post.excerpt || "",
        slug: post.slug || "",
        metaTitle: post.metaTitle || "",
        metaDescription: post.metaDescription || "",
        targetKeywords: post.targetKeywords?.join(", ") || "",
        seoAccountId: post.seoAccountId?._id || "",
        featuredImage: post.featuredImage || "",
        scheduledPublishDate: post.scheduledPublishDate ? 
          new Date(post.scheduledPublishDate).toISOString().slice(0, 16) : "",
        isScheduled: post.isScheduled || false
      });
    } catch (error) {
      console.error("Error fetching blog post:", error);
      toast.error("Failed to fetch blog post");
      navigate("/blog-posts");
    } finally {
      setLoading(false);
    }
  };

  const calculateWordCount = () => {
    const text = formData.content.replace(/<[^>]*>/g, ''); // Remove HTML tags
    const words = text.split(/\s+/).filter(word => word.length > 0);
    const count = words.length;
    const readTime = Math.ceil(count / 200); // 200 words per minute
    
    setWordCount(count);
    setReadTime(readTime);
  };

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));

    // Auto-generate slug from title
    if (name === "title" && !id) {
      setFormData(prev => ({
        ...prev,
        slug: generateSlug(value)
      }));
    }

    // Auto-generate meta title if empty
    if (name === "title" && !formData.metaTitle) {
      setFormData(prev => ({
        ...prev,
        metaTitle: value.slice(0, 60) // SEO recommended length
      }));
    }
  };

  const handleContentChange = (content) => {
    setFormData(prev => ({
      ...prev,
      content
    }));

    // Auto-generate excerpt if empty
    if (!formData.excerpt) {
      const text = content.replace(/<[^>]*>/g, '');
      const excerpt = text.slice(0, 160); // SEO recommended length
      setFormData(prev => ({
        ...prev,
        excerpt
      }));
    }
  };

  const handleSave = async (isDraft = false) => {
    if (!formData.title || !formData.content || !formData.seoAccountId) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setSaving(true);
      
      const submitData = {
        ...formData,
        targetKeywords: formData.targetKeywords.split(',').map(k => k.trim()).filter(k => k),
        status: isDraft ? "Draft" : "Under Review"
      };

      if (id) {
        await axios.put(`/api/blog-posts/${id}`, submitData);
        toast.success("Blog post updated successfully");
      } else {
        await axios.post("/api/blog-posts", submitData);
        toast.success("Blog post created successfully");
        navigate("/blog-posts");
      }
    } catch (error) {
      console.error("Error saving blog post:", error);
      toast.error(error.response?.data?.message || "Failed to save blog post");
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast.error("Image size should be less than 5MB");
      return;
    }

    try {
      const formData = new FormData();
      formData.append('image', file);
      
      // Note: You'll need to implement image upload endpoint
      const response = await axios.post('/api/upload/image', formData);
      setFormData(prev => ({
        ...prev,
        featuredImage: response.data.url
      }));
      toast.success("Image uploaded successfully");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#FAFBFF]">
        <Nav />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="loader border-t-4 border-blue-500 rounded-full w-12 h-12 animate-spin mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading editor...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#FAFBFF]">
      <Nav />
      
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/blog-posts")}
                className="text-gray-500 hover:text-gray-700"
              >
                <XIcon className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-800">
                  {id ? "Edit Blog Post" : "Create Blog Post"}
                </h1>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>{wordCount} words</span>
                  <span>{readTime} min read</span>
                  {formData.seoAccountId && (
                    <span>
                      {seoAccounts.find(acc => acc._id === formData.seoAccountId)?.accountName}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setPreviewMode(!previewMode)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition ${
                  previewMode 
                    ? "bg-blue-50 border-blue-200 text-blue-600" 
                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                <EyeIcon className="w-4 h-4" />
                {previewMode ? "Edit" : "Preview"}
              </button>

              <button
                onClick={() => handleSave(true)}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
              >
                <SaveIcon className="w-4 h-4" />
                Save Draft
              </button>

              <button
                onClick={() => handleSave(false)}
                disabled={saving}
                className="flex items-center gap-2 bg-[#00FFA6] text-white px-4 py-2 rounded-lg hover:bg-[#16A34A] transition disabled:opacity-50"
              >
                <DocumentTextIcon className="w-4 h-4" />
                {saving ? "Submitting..." : "Submit for Review"}
              </button>

              <ProfileMenu />
            </div>
          </div>
        </div>

        <div className="flex-1 flex">
          {/* Main Editor */}
          <div className="flex-1 p-6">
            {!previewMode ? (
              <div className="max-w-4xl mx-auto space-y-6">
                {/* Basic Info */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">Basic Information</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Title *
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter blog post title"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        SEO Account *
                      </label>
                      <select
                        name="seoAccountId"
                        value={formData.seoAccountId}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      >
                        <option value="">Select SEO Account</option>
                        {seoAccounts.map((account) => (
                          <option key={account._id} value={account._id}>
                            {account.accountName} ({account.domain})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Slug *
                        </label>
                        <input
                          type="text"
                          name="slug"
                          value={formData.slug}
                          onChange={handleInputChange}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="blog-post-url-slug"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Target Keywords
                        </label>
                        <input
                          type="text"
                          name="targetKeywords"
                          value={formData.targetKeywords}
                          onChange={handleInputChange}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="keyword1, keyword2, keyword3"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Excerpt
                      </label>
                      <textarea
                        name="excerpt"
                        value={formData.excerpt}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Brief description of the blog post"
                      />
                    </div>
                  </div>
                </div>

                {/* Content Editor */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">Content *</h2>
                  
                  {/* Simple Text Editor - In a real app, you'd use a rich text editor like TinyMCE or Quill */}
                  <div className="border border-gray-300 rounded-lg">
                    <div className="border-b border-gray-200 p-3 bg-gray-50">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>Rich text editor would go here (TinyMCE, Quill, etc.)</span>
                      </div>
                    </div>
                    <textarea
                      name="content"
                      value={formData.content}
                      onChange={(e) => handleContentChange(e.target.value)}
                      rows={20}
                      className="w-full p-4 border-0 focus:ring-0 focus:outline-none resize-none"
                      placeholder="Write your blog post content here... (HTML supported)"
                      required
                    />
                  </div>
                </div>

                {/* Featured Image */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">Featured Image</h2>
                  
                  <div className="space-y-4">
                    {formData.featuredImage ? (
                      <div className="relative">
                        <img
                          src={formData.featuredImage}
                          alt="Featured"
                          className="w-full h-48 object-cover rounded-lg"
                        />
                        <button
                          onClick={() => setFormData(prev => ({ ...prev, featuredImage: "" }))}
                          className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full hover:bg-red-700"
                        >
                          <XIcon className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                        <PhotographIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <div className="space-y-2">
                          <label className="cursor-pointer">
                            <span className="text-blue-600 hover:text-blue-800 font-medium">
                              Upload an image
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageUpload}
                              className="hidden"
                            />
                          </label>
                          <p className="text-sm text-gray-500">or drag and drop</p>
                          <p className="text-xs text-gray-400">PNG, JPG, GIF up to 5MB</p>
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Image URL (alternative)
                      </label>
                      <input
                        type="url"
                        name="featuredImage"
                        value={formData.featuredImage}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Preview Mode */
              <div className="max-w-4xl mx-auto">
                <article className="bg-white rounded-lg border border-gray-200 p-8">
                  {formData.featuredImage && (
                    <img
                      src={formData.featuredImage}
                      alt={formData.title}
                      className="w-full h-64 object-cover rounded-lg mb-8"
                    />
                  )}
                  
                  <header className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-4">
                      {formData.title || "Blog Post Title"}
                    </h1>
                    
                    {formData.excerpt && (
                      <p className="text-lg text-gray-600 mb-4">{formData.excerpt}</p>
                    )}
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>{wordCount} words</span>
                      <span>{readTime} min read</span>
                      {formData.targetKeywords && (
                        <div className="flex flex-wrap gap-1">
                          {formData.targetKeywords.split(',').map((keyword, index) => (
                            <span key={index} className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded">
                              {keyword.trim()}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </header>
                  
                  <div 
                    className="prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: formData.content || "<p>Blog content will appear here...</p>" }}
                  />
                </article>
              </div>
            )}
          </div>

          {/* SEO Sidebar */}
          {!previewMode && (
            <div className="w-80 bg-white border-l border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">SEO Settings</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meta Title
                  </label>
                  <input
                    type="text"
                    name="metaTitle"
                    value={formData.metaTitle}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="SEO title (60 chars max)"
                    maxLength="60"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.metaTitle.length}/60 characters
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meta Description
                  </label>
                  <textarea
                    name="metaDescription"
                    value={formData.metaDescription}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="SEO description (160 chars max)"
                    maxLength="160"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.metaDescription.length}/160 characters
                  </p>
                </div>

                {/* Publishing Options */}
                <div className="pt-4 border-t border-gray-200">
                  <h3 className="text-md font-semibold text-gray-800 mb-3">Publishing</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="isScheduled"
                        checked={formData.isScheduled}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 block text-sm text-gray-700">
                        Schedule for later
                      </label>
                    </div>

                    {formData.isScheduled && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Scheduled Date
                        </label>
                        <input
                          type="datetime-local"
                          name="scheduledPublishDate"
                          value={formData.scheduledPublishDate}
                          onChange={handleInputChange}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="pt-4 border-t border-gray-200">
                  <h3 className="text-md font-semibold text-gray-800 mb-3">Statistics</h3>
                  
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Word count:</span>
                      <span>{wordCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Reading time:</span>
                      <span>{readTime} min</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Keywords:</span>
                      <span>{formData.targetKeywords.split(',').filter(k => k.trim()).length}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlogEditor;
