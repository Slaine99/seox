import React, { useEffect } from 'react';
import {
  createBrowserRouter,
  RouterProvider,
  Outlet, 
  ScrollRestoration,
} from "react-router-dom";
import './App.css';
import Register from "./pages/Register";
import Login from "./pages/Login";
import Home from "./pages/Home";
import { Toaster } from "react-hot-toast";
import VerifyEmail from "./pages/VerifyEmail";
import { AuthProvider, useAuth } from "./context/authContext";
import { ProfileProvider } from "./context/profileContext";
import axios from "axios";
import { baseUrl } from "../apiConfig";
import LoggedInPage from './pages/LoggedInPage';
import UnderConstruction from './pages/UnderConstruction';
import NotFound from "./pages/NotFound";
import ReportingPage from './pages/ReportingPage';
import ProtectedRoute from './components/ProtectedRoute';

// SEO-X Platform Pages
import SeoAccounts from './pages/SeoAccountsPage';
import BlogPosts from './pages/BlogPosts';
import Backlinks from './pages/Backlinks';
import UserManagement from './pages/UserManagement';
import SeoAnalytics from './pages/SeoAnalytics';
import ClientRegister from './pages/ClientRegister';
import ClientDashboard from './pages/ClientDashboard';
import Settings from './pages/Settings';

const Layout = () => {
  const { isAuthenticated, checkAuth } = useAuth();

  useEffect(() => {
    // Check if we're on the login page - don't auto-authenticate there
    const isLoginPage = window.location.pathname === '/login';
    const isRegisterPage = window.location.pathname === '/register';
    
    if (!isLoginPage && !isRegisterPage) {
      checkAuth();
    }
  }, []);

  return (
    <>
      <ScrollRestoration />
      <Outlet />
    </>
  );
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "*",
        element: <NotFound />,
      },
      {
        path: "/home",
        element: <LoggedInPage />,
      },
  // Removed duplicate /settings route to Profile
      // SEO-X specific routes
      {
        path: "/seo-accounts",
        element: (
          <ProtectedRoute allowedRoles={['Owner', 'Admin', 'Agency']}>
            <SeoAccounts />
          </ProtectedRoute>
        ),
      },
      {
        path: "/blog-posts",
        element: <BlogPosts />,
      },
      {
        path: "/backlinks",
        element: <Backlinks />,
      },
      {
        path: "/analytics",
        element: <SeoAnalytics />,
      },
      {
        path: "/client-dashboard",
        element: <ClientDashboard />,
      },
      {
        path: "/user-management",
        element: (
          <ProtectedRoute allowedRoles={['Owner', 'Admin']}>
            <UserManagement />
          </ProtectedRoute>
        ),
      },
      {
        path: "/settings",
        element: <Settings />,
      },
      {
        path: "/profile",
        element: <Settings />,
      },
      {
        path: "reporting",
        element: <ReportingPage />,
      },
      {
        path: "help-center",
        element: <UnderConstruction />,
      },
      {
        path: "register",
        element: <Register />,
      },
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "users/:id/verify/:token",
        element: <VerifyEmail />,
      },
      {
        path: "client/register/:token",
        element: <ClientRegister />,
      }
    ],
  },
]);

function App() {
  axios.defaults.baseURL = baseUrl;
  axios.defaults.withCredentials = true;

  // Add this right after your axios configuration
  axios.interceptors.response.use(
    response => response,
    error => {
      // If we get a 401 (Unauthorized) response, clear auth state
      if (error.response && error.response.status === 401) {
        document.cookie = 'authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;';
        // Don't redirect if we're already on the login page to avoid infinite loops
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
      return Promise.reject(error);
    }
  );

  return (
    <>
      <AuthProvider>
        <ProfileProvider>
          <RouterProvider router={router} />
          <Toaster />
        </ProfileProvider>
      </AuthProvider>
    </>
  );
}

export default App;
