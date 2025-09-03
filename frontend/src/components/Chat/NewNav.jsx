import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/authContext';

const Nav = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const isActive = (path) => {
    return location.pathname === path || activeTab === path;
  };
  
  return (
    <div className="w-64 bg-white shadow-lg h-screen fixed left-0 top-0">
      {/* Logo Section */}
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-blue-600">SEO-X</h1>
        <p className="text-sm text-gray-500">SEO Management Platform</p>
      </div>

      {/* Navigation Menu */}
      <nav className="mt-6">
        <div className="px-4">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Main
          </h3>
          <ul className="space-y-2">
            <li>
              <Link 
                to="/home" 
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center px-3 py-2 rounded-md transition-colors ${
                  isActive('/home') || isActive('dashboard')
                    ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600' 
                    : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                }`}
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m7 7l5-5 5 5" />
                </svg>
                Dashboard
              </Link>
            </li>
            {/* Show SEO Accounts only for Agency/Admin roles */}
            {user?.role !== 'Client' && (
              <li>
                <Link 
                  to="/seo-accounts" 
                  onClick={() => setActiveTab('seo-accounts')}
                  className={`flex items-center px-3 py-2 rounded-md transition-colors ${
                    isActive('/seo-accounts') || isActive('seo-accounts')
                      ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600' 
                      : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                  }`}
                >
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 00-2 2H8a2 2 0 00-2-2V6m8 0h2a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2h2" />
                  </svg>
                  SEO Accounts
                </Link>
              </li>
            )}
            <li>
              <Link 
                to="/blog-posts" 
                onClick={() => setActiveTab('blog-posts')}
                className={`flex items-center px-3 py-2 rounded-md transition-colors ${
                  isActive('/blog-posts') || isActive('blog-posts')
                    ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600' 
                    : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                }`}
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Blog Posts
              </Link>
            </li>
            <li>
              <Link 
                to="/backlinks" 
                onClick={() => setActiveTab('backlinks')}
                className={`flex items-center px-3 py-2 rounded-md transition-colors ${
                  isActive('/backlinks') || isActive('backlinks')
                    ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600' 
                    : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                }`}
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                Backlinks
              </Link>
            </li>
          </ul>
        </div>

        {/* Role-based menu items */}
        {user?.role === 'Admin' && (
          <div className="px-4 mt-6">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Admin
            </h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/user-management" 
                  onClick={() => setActiveTab('user-management')}
                  className={`flex items-center px-3 py-2 rounded-md transition-colors ${
                    isActive('/user-management') || isActive('user-management')
                      ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600' 
                      : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                  }`}
                >
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                  User Management
                </Link>
              </li>
              <li>
                <Link 
                  to="/analytics" 
                  onClick={() => setActiveTab('analytics')}
                  className={`flex items-center px-3 py-2 rounded-md transition-colors ${
                    isActive('/analytics') || isActive('analytics')
                      ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600' 
                      : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                  }`}
                >
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2-2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Analytics
                </Link>
              </li>
            </ul>
          </div>
        )}

        {/* User Info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-blue-600">
                {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
              </span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Nav;
