import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";
import { useAuth } from "./authContext";
import toast from "react-hot-toast";

const ProfileContext = createContext();

export const ProfileProvider = ({ children }) => {
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated, user } = useAuth();

  const refreshUserDetails = async () => {
    try {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      setLoading(true);
      console.log("Fetching user profile...");
      
      // Make sure we have authorization headers set
      const token = localStorage.getItem("authToken");
      if (token) {
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      }
      
      const response = await axios.get("/api/user/profile");
      
      console.log("Profile data received:", response.data);
      
      if (response.data && response.data.user) {
        setUserDetails(response.data.user);
      } else {
        console.error("Invalid profile data format:", response.data);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      if (error.response?.status === 401) {
        // If unauthorized, could be a token issue
        toast.error("Session expired. Please log in again.");
      } else {
        toast.error("Failed to load profile data");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      refreshUserDetails();
    } else {
      setUserDetails(null);
      setLoading(false);
    }
  }, [isAuthenticated, user?._id]);

  return (
    <ProfileContext.Provider
      value={{
        userDetails,
        loading,
        refreshUserDetails,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => useContext(ProfileContext);
