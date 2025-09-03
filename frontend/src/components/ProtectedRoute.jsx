import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';

const ProtectedRoute = ({ children, allowedRoles, redirectTo = '/home' }) => {
  const { user, loading } = useAuth();

  console.log("=== ProtectedRoute Debug ===");
  console.log("Loading:", loading);
  console.log("User:", user);
  console.log("User role:", user?.role);
  console.log("Allowed roles:", allowedRoles);
  console.log("Redirect to:", redirectTo);

  // Show loading while checking authentication
  if (loading) {
    console.log("Still loading, showing loading screen");
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // If no user details, redirect to login
  if (!user) {
    console.log("No user, redirecting to login");
    return <Navigate to="/login" replace />;
  }

  // If allowedRoles is specified, check if user role is allowed
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    console.log(`User role ${user.role} not in allowed roles ${allowedRoles}, redirecting to ${redirectTo}`);
    return <Navigate to={redirectTo} replace />;
  }

  console.log("User is authenticated and authorized, rendering children");
  // User is authenticated and authorized
  return children;
};

export default ProtectedRoute;
