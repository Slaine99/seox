import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";
import { useProfile } from "../context/profileContext";
import { UserIcon } from "@heroicons/react/outline";
import axios from "axios";
import { toast } from "react-hot-toast";

const ProfileMenu = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { userDetails } = useProfile();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const [loggingOut, setLoggingOut] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  // Enhanced logout function to ensure proper logout
  const handleLogout = async () => {
    if (loggingOut) return; // Prevent multiple clicks
    
    try {
      setLoggingOut(true);
      setShowDropdown(false);
      
      // Show logout message
      toast.success("Logging out...");
      
      // Call the main logout function from context
      await logout();
      
      // As a fallback, also try these additional methods:
      // Clear cookies directly
      document.cookie = 'authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; domain=' + window.location.hostname;
      document.cookie = 'authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;';
      document.cookie = 'authToken=; path=/; max-age=0;';
      
      // Clear axios headers
      delete axios.defaults.headers.common['Authorization'];
      
      // Force redirect after a short delay
      setTimeout(() => {
        window.location.href = '/login';
      }, 300);
    } catch (error) {
      console.error("Logout failed:", error);
      // If normal logout fails, force a hard redirect
      window.location.href = '/login';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shadow-md hover:shadow-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
        title={`${userDetails?.firstName || "User"} ${userDetails?.lastName || ""}`}
      >
        <UserIcon className="h-5 w-5" />
      </button>
      
      {showDropdown && (
        <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-md shadow-lg z-10 overflow-hidden">
          {/* User info section */}
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
            <p className="text-sm font-semibold text-gray-700">{`${userDetails?.firstName || "User"} ${userDetails?.lastName || ""}`}</p>
            <p className="text-xs text-gray-500 truncate">{userDetails?.email || ""}</p>
          </div>
          
          {/* Menu items */}
          <div className="py-1">
            <Link
              to="/settings"
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => setShowDropdown(false)}
            >
              <svg 
                className="h-4 w-4 mr-2 text-gray-500" 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" 
                />
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" 
                />
              </svg>
              Settings
            </Link>
            
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-75"
            >
              <svg 
                className="h-4 w-4 mr-2 text-red-500" 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" 
                />
              </svg>
              {loggingOut ? "Logging out..." : "Logout"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileMenu;