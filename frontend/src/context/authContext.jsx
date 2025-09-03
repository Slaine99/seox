import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from "react-hot-toast";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is authenticated
  const checkAuth = async () => {
    try {
      const response = await axios.get('/api/user/profile');
      // Store the complete user object including role and relationships
      setUser(response.data.user);
      setAuthenticated(true);
      setLoading(false);
    } catch (error) {
      setAuthenticated(false);
      setUser(null);
      setLoading(false);
    }
  };

  // Login function
  const login = async (credentials) => {
    try {
      const response = await axios.post('/api/user/login', credentials);
      
      if (response.data.token) {
        // Save token in cookie
        document.cookie = `authToken=${response.data.token}; path=/; max-age=604800`;
        // Store complete user object
        setUser(response.data.user);
        setAuthenticated(true);
        toast.success(response.data.message || "Logged in successfully");
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.response?.data?.message || "Login failed");
      throw error;
    }
  };

  // Replace your current logout function with this improved version
  const logout = async () => {
    try {
      console.log("Logging out...");
      
      // First clear local auth state
      setAuthenticated(false);
      setUser(null);
      
      // Clear the token cookie using all possible variations
      document.cookie = 'authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; domain=' + window.location.hostname;
      document.cookie = 'authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;';
      document.cookie = 'authToken=; path=/; max-age=0;';
      
      // Clear axios authorization header
      delete axios.defaults.headers.common['Authorization'];
      
      // Make an actual logout request to the backend to invalidate session
      await axios.post('/api/user/logout').catch(err => {
        console.log("Logout endpoint error (this is fine if endpoint doesn't exist):", err);
      });
      
      // Add a small delay to ensure state updates are processed
      setTimeout(() => {
        console.log("Redirecting to login page...");
        // Force page reload to clear any cached state
        window.location.href = '/login';
      }, 100);
      
    } catch (error) {
      console.error('Logout error:', error);
      // If anything fails, force a hard reload to the login page
      window.location.href = '/login';
    }
  };

  useEffect(() => {
    // Check if there's actually a token before attempting authentication
    const hasToken = document.cookie.includes('authToken=');
    if (hasToken) {
      checkAuth();
    } else {
      // No token exists, so definitely not authenticated
      setAuthenticated(false);
      setUser(null);
      setLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      setAuthenticated, 
      user, 
      setUser, 
      login, 
      logout, 
      checkAuth,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
