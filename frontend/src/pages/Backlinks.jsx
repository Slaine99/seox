import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/authContext';
import Nav from '../components/Chat/Nav';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import ProfileMenu from '../components/ProfileMenu';

const Backlinks = () => {
  const { user } = useAuth();
  const [backlinks, setBacklinks] = useState([]);
  const [seoAccounts, setSeoAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBacklinks: 0,
    liveLinks: 0,
    pendingLinks: 0,
    averageDA: 0
  });
  const [filters, setFilters] = useState({
    seoAccount: '',
    status: '',
    linkType: '',
    search: ''
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    sourceUrl: '',
    targetUrl: '',
    anchorText: '',
    seoAccount: '',
    linkType: 'dofollow',
    linkPlacement: 'content',
    sourceDA: 0,
    sourceDR: 0,
    status: 'prospecting',
    campaign: '',
    cost: 0,
    contactEmail: '',
    contactName: '',
    notes: ''
  });

  useEffect(() => {
    fetchBacklinks();
    fetchSeoAccounts();
    fetchStats();
  }, [filters]);

  const fetchBacklinks = async () => {
    try {
      setLoading(true);
      const params = {
        ...filters,
        page: 1,
        limit: 100
      };
      const response = await axios.get('/api/backlinks', { params });
      setBacklinks(response.data.backlinks);
    } catch (error) {
      console.error('Error fetching backlinks:', error);
      toast.error('Failed to fetch backlinks');
    } finally {
      setLoading(false);
    }
  };

  const fetchSeoAccounts = async () => {
    try {
      const response = await axios.get('/api/seo-accounts');
      setSeoAccounts(response.data.seoAccounts);
    } catch (error) {
      console.error('Error fetching SEO accounts:', error);
    }
  };

  const fetchStats = async () => {
    try {
      // Calculate stats from backlinks
      const response = await axios.get('/api/backlinks');
      const allBacklinks = response.data.backlinks;
      
      const totalBacklinks = allBacklinks.length;
      const liveLinks = allBacklinks.filter(b => b.status === 'live').length;
      const pendingLinks = allBacklinks.filter(b => 
        ['prospecting', 'outreach', 'negotiating', 'content_creation'].includes(b.status)
      ).length;
      const averageDA = allBacklinks.length > 0 
        ? Math.round(allBacklinks.reduce((sum, b) => sum + (b.sourceDA || 0), 0) / allBacklinks.length)
        : 0;

      setStats({
        totalBacklinks,
        liveLinks,
        pendingLinks,
        averageDA
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleCreateBacklink = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/backlinks', formData);
      toast.success('Backlink created successfully');
      setShowCreateModal(false);
      resetForm();
      fetchBacklinks();
      fetchStats();
    } catch (error) {
      console.error('Error creating backlink:', error);
      toast.error(error.response?.data?.message || 'Failed to create backlink');
    }
  };

  const resetForm = () => {
    setFormData({
      sourceUrl: '',
      targetUrl: '',
      anchorText: '',
      seoAccount: '',
      linkType: 'dofollow',
      linkPlacement: 'content',
      sourceDA: 0,
      sourceDR: 0,
      status: 'prospecting',
      campaign: '',
      cost: 0,
      contactEmail: '',
      contactName: '',
      notes: ''
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      prospecting: 'bg-gray-100 text-gray-800',
      outreach: 'bg-blue-100 text-blue-800',
      negotiating: 'bg-yellow-100 text-yellow-800',
      content_creation: 'bg-purple-100 text-purple-800',
      published: 'bg-green-100 text-green-800',
      live: 'bg-green-100 text-green-800',
      lost: 'bg-red-100 text-red-800',
      removed: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="flex min-h-screen bg-[#FAFBFF]">
      <Nav />
      <div className="flex-1 flex flex-col p-6 ml-64">
        <div className="max-w-7xl mx-auto w-full">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Backlink Management</h1>
              <p className="text-gray-600 mt-2">Track and manage your SEO backlink campaigns</p>
            </div>
            <ProfileMenu />
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Backlinks</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalBacklinks}</p>
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
                  <p className="text-sm font-medium text-gray-600">Live Links</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.liveLinks}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pendingLinks}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avg DA</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.averageDA}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters and Controls */}
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <div className="flex flex-wrap gap-4 items-center justify-between">
              <div className="flex flex-wrap gap-4">
                <select
                  value={filters.seoAccount}
                  onChange={(e) => setFilters({ ...filters, seoAccount: e.target.value })}
                  className="border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="">All SEO Accounts</option>
                  {seoAccounts.map(account => (
                    <option key={account._id} value={account._id}>
                      {account.accountName}
                    </option>
                  ))}
                </select>

                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="">All Statuses</option>
                  <option value="prospecting">Prospecting</option>
                  <option value="outreach">Outreach</option>
                  <option value="negotiating">Negotiating</option>
                  <option value="content_creation">Content Creation</option>
                  <option value="published">Published</option>
                  <option value="live">Live</option>
                  <option value="lost">Lost</option>
                </select>

                <select
                  value={filters.linkType}
                  onChange={(e) => setFilters({ ...filters, linkType: e.target.value })}
                  className="border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="">All Link Types</option>
                  <option value="dofollow">Dofollow</option>
                  <option value="nofollow">Nofollow</option>
                </select>

                <input
                  type="text"
                  placeholder="Search domains, anchor text..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="border border-gray-300 rounded-lg px-3 py-2 w-64"
                />
              </div>

              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Backlink
              </button>
            </div>
          </div>

          {/* Backlinks Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Source Domain
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Anchor Text
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      SEO Account
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      DA/DR
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                        Loading backlinks...
                      </td>
                    </tr>
                  ) : backlinks.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                        No backlinks found. Create your first backlink to get started.
                      </td>
                    </tr>
                  ) : (
                    backlinks.map((backlink) => (
                      <tr key={backlink._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {backlink.sourceDomain}
                            </div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {backlink.sourceUrl}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 max-w-xs truncate">
                            {backlink.anchorText}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {backlink.seoAccount?.accountName || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {backlink.sourceDA || 0} / {backlink.sourceDR || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(backlink.status)}`}>
                            {backlink.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            backlink.linkType === 'dofollow' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {backlink.linkType}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(backlink.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Create Backlink Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Create New Backlink</h3>
            
            <form onSubmit={handleCreateBacklink} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Source URL *
                  </label>
                  <input
                    type="url"
                    value={formData.sourceUrl}
                    onChange={(e) => setFormData({ ...formData, sourceUrl: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target URL *
                  </label>
                  <input
                    type="url"
                    value={formData.targetUrl}
                    onChange={(e) => setFormData({ ...formData, targetUrl: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Anchor Text *
                  </label>
                  <input
                    type="text"
                    value={formData.anchorText}
                    onChange={(e) => setFormData({ ...formData, anchorText: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SEO Account *
                  </label>
                  <select
                    value={formData.seoAccount}
                    onChange={(e) => setFormData({ ...formData, seoAccount: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select SEO Account</option>
                    {seoAccounts.map(account => (
                      <option key={account._id} value={account._id}>
                        {account.accountName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Link Type
                  </label>
                  <select
                    value={formData.linkType}
                    onChange={(e) => setFormData({ ...formData, linkType: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="dofollow">Dofollow</option>
                    <option value="nofollow">Nofollow</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="prospecting">Prospecting</option>
                    <option value="outreach">Outreach</option>
                    <option value="negotiating">Negotiating</option>
                    <option value="content_creation">Content Creation</option>
                    <option value="published">Published</option>
                    <option value="live">Live</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Source DA
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.sourceDA}
                    onChange={(e) => setFormData({ ...formData, sourceDA: parseInt(e.target.value) || 0 })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Source DR
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.sourceDR}
                    onChange={(e) => setFormData({ ...formData, sourceDR: parseInt(e.target.value) || 0 })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows="3"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
                >
                  Create Backlink
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Backlinks;
