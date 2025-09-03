import React, { useState, useEffect } from "react";
import Nav from "../components/Chat/Nav";
import { useAuth } from "../context/authContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import ProfileMenu from "../components/ProfileMenu";
import { getEnhancedUserStats } from "../services/api";

const UserManagement = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [agencies, setAgencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAgency, setSelectedAgency] = useState(null);
  const [agencyClients, setAgencyClients] = useState([]);
  const [showClientModal, setShowClientModal] = useState(false);
  const [loadingClients, setLoadingClients] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAgency, setEditingAgency] = useState(null);
  const [editFormData, setEditFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    companyName: '',
    role: 'Agency'
  });
  const [stats, setStats] = useState({
    totalAgencies: 0,
    totalClients: 0,
    activeAgencies: 0
  });

  useEffect(() => {
    console.log("=== UserManagement useEffect ===");
    console.log("UserManagement - Current user:", user);
    console.log("UserManagement - User role:", user?.role);
    console.log("UserManagement - User object keys:", user ? Object.keys(user) : "No user");
    
    if (!user) {
      console.log("No user found, redirecting to home");
      navigate("/home");
      return;
    }
    
    // Temporarily allow all authenticated users for debugging
    // if (user.role !== "Admin") {
    //   console.log("User role is not Admin, current role:", user.role);
    //   navigate("/home");
    //   return;
    // }
    
    console.log("User authenticated, proceeding to fetch data");
    console.log("About to call fetchAgencies and fetchStats");
    fetchAgencies();
    fetchStats();
  }, [user, navigate, searchTerm]);

  const fetchAgencies = async () => {
    try {
      console.log("=== fetchAgencies called ===");
      console.log("Search term:", searchTerm);
      setLoading(true);
      const params = { role: "Agency", search: searchTerm };
      console.log("API params:", params);
      
      const response = await axios.get("/api/users", { params });
      console.log("API response:", response.data);
      
      setAgencies(response.data.users);
      console.log("Agencies set:", response.data.users);
    } catch (error) {
      console.error("Error fetching agencies:", error);
      console.error("Error response:", error.response?.data);
      toast.error("Failed to fetch agencies");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      console.log("=== fetchStats called ===");
      const response = await getEnhancedUserStats();
      console.log("Enhanced stats response:", response);
      setStats(response);
    } catch (error) {
      console.error("Error fetching stats:", error);
      // Try fallback API
      try {
        const fallbackResponse = await axios.get("/api/users/stats");
        setStats(fallbackResponse.data);
      } catch (fallbackError) {
        console.error("Fallback stats API also failed:", fallbackError);
      }
    }
  };

  const fetchAgencyClients = async (agencyId) => {
    try {
      console.log("=== fetchAgencyClients called ===");
      console.log("Agency ID:", agencyId);
      setLoadingClients(true);
      
      // Fetch both client users and SEO accounts for this agency
      const [clientsResponse, seoAccountsResponse] = await Promise.all([
        axios.get(`/api/users/agency/${agencyId}/clients`),
        axios.get(`/api/seo-accounts/agency/${agencyId}`)
      ]);
      
      console.log("Clients API response:", clientsResponse.data);
      console.log("SEO Accounts API response:", seoAccountsResponse.data);
      
      const clients = clientsResponse.data.clients || [];
      const seoAccounts = seoAccountsResponse.data.seoAccounts || seoAccountsResponse.data || [];
      
      console.log("Clients found:", clients);
      console.log("SEO Accounts found:", seoAccounts);
      
      // Combine clients and SEO accounts into a single array
      const combined = [
        ...clients.map(client => ({ ...client, type: 'client' })),
        ...seoAccounts.map(account => ({ ...account, type: 'seoAccount' }))
      ];
      
      setAgencyClients(combined);
    } catch (error) {
      console.error("Error fetching agency clients:", error);
      console.error("Error response:", error.response?.data);
      toast.error("Failed to fetch clients");
      setAgencyClients([]);
    } finally {
      setLoadingClients(false);
    }
  };

  const handleViewClients = async (agency) => {
    setSelectedAgency(agency);
    setShowClientModal(true);
    await fetchAgencyClients(agency._id);
  };

  const closeClientModal = () => {
    setShowClientModal(false);
    setSelectedAgency(null);
    setAgencyClients([]);
  };

  const handleEditAgency = (agency) => {
    setEditingAgency(agency);
    setEditFormData({
      firstName: agency.firstName || '',
      lastName: agency.lastName || '',
      email: agency.email || '',
      companyName: agency.companyName || '',
      role: agency.role || 'Agency'
    });
    setShowEditModal(true);
  };

  const handleUpdateAgency = async () => {
    try {
      const response = await axios.put(`/api/users/${editingAgency._id}`, {
        name: `${editFormData.firstName} ${editFormData.lastName}`,
        email: editFormData.email,
        companyName: editFormData.companyName,
        role: editFormData.role
      });
      
      toast.success("Agency updated successfully");
      setShowEditModal(false);
      setEditingAgency(null);
      fetchAgencies(); // Refresh the list
    } catch (error) {
      console.error("Error updating agency:", error);
      toast.error("Failed to update agency");
    }
  };

  const handleDeleteAgency = async (agencyId, agencyName) => {
    if (window.confirm(`Are you sure you want to delete "${agencyName}"? This action cannot be undone.`)) {
      try {
        await axios.delete(`/api/users/${agencyId}`);
        toast.success("Agency deleted successfully");
        fetchAgencies(); // Refresh the list
      } catch (error) {
        console.error("Error deleting agency:", error);
        toast.error("Failed to delete agency");
      }
    }
  };

  const handleRemoveClient = async (clientId, clientName, clientType) => {
    if (window.confirm(`Are you sure you want to remove "${clientName}"?`)) {
      try {
        if (clientType === 'client') {
          await axios.delete(`/api/users/${clientId}`);
        } else if (clientType === 'seoAccount') {
          await axios.delete(`/api/seo-accounts/${clientId}`);
        }
        
        toast.success(`${clientType === 'client' ? 'Client' : 'SEO Account'} removed successfully`);
        fetchAgencyClients(selectedAgency._id); // Refresh the client list
      } catch (error) {
        console.error("Error removing client:", error);
        toast.error("Failed to remove client");
      }
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Nav />
      
      <div className="flex-1 ml-64 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
              <p className="text-gray-600 mt-2">Manage agencies and their clients</p>
            </div>
            <ProfileMenu />
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Agencies</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalAgencies || 0}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Clients</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalClients || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Users</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.active || 0}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="bg-white p-6 rounded-lg shadow mb-8">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Search Agencies</label>
                <input
                  type="text"
                  placeholder="Search by agency name, company, or email..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Agencies Grid */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Agencies</h3>
              <p className="text-sm text-gray-600">Click on an agency to view their clients</p>
            </div>
            
            <div className="p-6">
              {loading ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="mt-2 text-gray-600">Loading agencies...</p>
                </div>
              ) : agencies.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No agencies found.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {agencies.map((agency) => (
                    <div
                      key={agency._id}
                      className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-semibold text-lg">
                              {(agency.firstName || agency.companyName || agency.email).charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-3">
                            <h4 className="text-lg font-semibold text-gray-900">
                              {agency.firstName} {agency.lastName}
                            </h4>
                            <p className="text-sm text-gray-600">{agency.email}</p>
                          </div>
                        </div>
                        
                        {/* Admin Actions */}
                        {user?.role === 'Admin' && (
                          <div className="flex gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditAgency(agency);
                              }}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit Agency"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteAgency(agency._id, `${agency.firstName} ${agency.lastName}`);
                              }}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete Agency"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-gray-600">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          {agency.companyName || "No company"}
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-600">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4v10a2 2 0 002 2h4a2 2 0 002-2V11M8 11h8" />
                          </svg>
                          Joined {formatDate(agency.createdAt)}
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <button 
                          className="w-full bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors"
                          onClick={() => handleViewClients(agency)}
                        >
                          View Clients & SEO Accounts
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Client Modal */}
          {showClientModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl max-h-[80vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-semibold">
                      {selectedAgency?.firstName} {selectedAgency?.lastName} - Clients
                    </h3>
                    <p className="text-gray-600">{selectedAgency?.companyName}</p>
                  </div>
                  <button
                    onClick={closeClientModal}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                {loadingClients ? (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="mt-2 text-gray-600">Loading clients...</p>
                  </div>
                ) : agencyClients.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">This agency has no clients or SEO accounts yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {agencyClients.map((item) => (
                      <div key={item._id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              item.type === 'client' ? 'bg-green-500' : 'bg-blue-500'
                            }`}>
                              <span className="text-white font-semibold">
                                {item.type === 'client' 
                                  ? (item.firstName || item.email).charAt(0).toUpperCase()
                                  : (item.accountName || item.domain).charAt(0).toUpperCase()
                                }
                              </span>
                            </div>
                            <div className="ml-3 flex-1">
                              {item.type === 'client' ? (
                                <>
                                  <h4 className="font-semibold text-gray-900">
                                    {item.firstName} {item.lastName}
                                  </h4>
                                  <p className="text-sm text-gray-600">{item.email}</p>
                                  <p className="text-xs text-green-600 font-medium">Client User</p>
                                </>
                              ) : (
                                <>
                                  <h4 className="font-semibold text-gray-900">
                                    {item.accountName}
                                  </h4>
                                  <p className="text-sm text-gray-600">{item.domain}</p>
                                  <p className="text-xs text-blue-600 font-medium">SEO Account</p>
                                  
                                  {/* SEO Account Stats */}
                                  <div className="flex gap-4 mt-2 text-xs text-gray-500">
                                    <span>Blogs: {item.totalBlogPosts || 0}</span>
                                    <span>Backlinks: {item.totalBacklinks || 0}</span>
                                    <span>Budget: ${item.monthlyBudget || 0}/month</span>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <p className="text-sm text-gray-600">
                                {item.type === 'client' ? (
                                  <>
                                    {item.companyName && (
                                      <span className="block">{item.companyName}</span>
                                    )}
                                    <span className="text-xs">Joined {formatDate(item.createdAt)}</span>
                                  </>
                                ) : (
                                  <>
                                    <span className="text-xs">Created {formatDate(item.createdAt)}</span>
                                  </>
                                )}
                              </p>
                            </div>
                            
                            {/* Admin Remove Button */}
                            {user?.role === 'Admin' && (
                              <button
                                onClick={() => handleRemoveClient(
                                  item._id,
                                  item.type === 'client' ? `${item.firstName} ${item.lastName}` : item.accountName,
                                  item.type
                                )}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Remove"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Edit Agency Modal */}
          {showEditModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold">Edit Agency</h3>
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                    <input
                      type="text"
                      value={editFormData.firstName}
                      onChange={(e) => setEditFormData({ ...editFormData, firstName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                    <input
                      type="text"
                      value={editFormData.lastName}
                      onChange={(e) => setEditFormData({ ...editFormData, lastName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={editFormData.email}
                      onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                    <input
                      type="text"
                      value={editFormData.companyName}
                      onChange={(e) => setEditFormData({ ...editFormData, companyName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => setShowEditModal(false)}
                      className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleUpdateAgency}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Update Agency
                    </button>
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

export default UserManagement;
