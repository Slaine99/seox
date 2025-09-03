import React, { useState, useEffect } from "react";
import { useProfile } from "../context/profileContext";
import Nav from "./Chat/Nav";
import { toast } from "react-hot-toast";
import axios from "axios";
import LoadingSpinner from "./LoadingSpinner"; // Make sure this exists

const Profile = () => {
  const { userDetails, loading, refreshUserDetails } = useProfile();
  const [formData, setFormData] = useState({
    companyName: "",
    companyAddress: "",
    postalCode: "",
    city: "",
    kvkNumber: "",
    contactPersonFirstName: "",
    contactPersonLastName: "",
  });
  const [localLoading, setLocalLoading] = useState(false);

  useEffect(() => {
    if (userDetails) {
      setFormData({
        companyName: userDetails.companyName || "",
        companyAddress: userDetails.companyAddress || "",
        postalCode: userDetails.postalCode || "",
        city: userDetails.city || "",
        kvkNumber: userDetails.kvkNumber || "",
        contactPersonFirstName: userDetails.contactPersonFirstName || "",
        contactPersonLastName: userDetails.contactPersonLastName || "",
      });
    }
  }, [userDetails]);

  useEffect(() => {
    console.log("Profile context state:", { userDetails, loading });
  }, [userDetails, loading]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLocalLoading(true);
      const response = await axios.put("/api/user/profile/update", formData);
      toast.success(response.data.message || "Profile updated successfully");
      refreshUserDetails();
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setLocalLoading(false);
    }
  };

  const showDebugInfo = false; // Set to true for debugging

  if (loading) {
    return (
      <div className="flex h-screen">
        <Nav />
        <div className="flex-1 flex items-center justify-center">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <Nav />
      <div className="flex-1 p-8 overflow-y-auto">
        <h1 className="text-2xl font-bold mb-6">Clinic Settings</h1>
        
        {/* Debug information - only visible during development */}
        {showDebugInfo && userDetails && (
          <div className="mb-4 p-4 bg-gray-100 rounded-md">
            <p className="font-bold">Debug Information:</p>
            <p>User email: {userDetails.email}</p>
            <p>User role: {userDetails.role}</p>
            <pre className="mt-2 text-xs overflow-auto max-h-40">
              {JSON.stringify(userDetails, null, 2)}
            </pre>
          </div>
        )}
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <form onSubmit={handleSubmit}>
            {/* Form fields here */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Name
                </label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  KVK Number
                </label>
                <input
                  type="text"
                  name="kvkNumber"
                  value={formData.kvkNumber}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Address
                </label>
                <input
                  type="text"
                  name="companyAddress"
                  value={formData.companyAddress}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Postal Code
                </label>
                <input
                  type="text"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Person First Name
                </label>
                <input
                  type="text"
                  name="contactPersonFirstName"
                  value={formData.contactPersonFirstName}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Person Last Name
                </label>
                <input
                  type="text"
                  name="contactPersonLastName"
                  value={formData.contactPersonLastName}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={localLoading}
                className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  localLoading ? "opacity-75 cursor-not-allowed" : ""
                }`}
              >
                {localLoading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
