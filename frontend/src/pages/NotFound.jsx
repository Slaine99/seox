import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      {/* Header with logo */}
      <div className="mb-8">
        <img
          src="/src/assets/gerlogo.png"
          alt="Guardianship & Estate Realty Logo"
          className="h-12"
        />
      </div>

      {/* Construction notice */}
      <div className="w-full max-w-md p-4 mb-6 bg-yellow-100 border border-yellow-400 rounded-lg text-center">
        <div className="flex items-center justify-center mb-2">
          <svg className="w-5 h-5 mr-2 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span className="font-bold text-yellow-800">Site Under Construction</span>
        </div>
        <p className="text-sm text-yellow-700">
          This page is under development. We're working to make this section available soon.
        </p>
      </div>

      {/* 404 Message */}
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
        <div className="mb-6">
          <svg className="w-24 h-24 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
          </svg>
        </div>
        
        <h1 className="text-4xl font-bold text-gray-800 mb-2">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Page Not Found</h2>
        
        <p className="text-gray-600 mb-8">
          We're sorry, but the page you're looking for is currently under construction or doesn't exist.
        </p>
        
        <Link 
          to="/" 
          className="inline-block px-6 py-3 bg-[#00FFA6] text-white font-medium rounded-lg hover:bg-[#16A34A] transition"
        >
          Return to Home Page
        </Link>
      </div>
      
      {/* Construction Icons */}
      <div className="mt-8 flex items-center gap-6">
        <div className="w-12 h-12 text-gray-500 opacity-70">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="w-12 h-12 text-gray-500 opacity-70">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default NotFound;