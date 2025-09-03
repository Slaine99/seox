import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useAuth } from "../context/authContext";

const Login = () => {
  const [data, setData] = useState({ email: "", password: "" });
  const { isAuthenticated, setAuthenticated, login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) navigate("/home");
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => setData({ ...data, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Use the login function from auth context instead of manually setting authenticated
      const success = await login(data);
      if (success) {
        navigate("/home");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error(error.response?.data?.message || "An error occurred");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
      {/* Logo Section */}
      <div className="mb-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-blue-600">SEO-X</h1>
          <p className="text-sm text-gray-500">SEO Management Platform</p>
        </div>
      </div>

      {/* Login Box */}
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-gray-700">Login</h1>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm text-gray-700 font-medium">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              id="email"
              placeholder="Email Address"
              value={data.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm text-gray-700 font-medium">
              Password
            </label>
            <input
              type="password"
              name="password"
              id="password"
              placeholder="Password"
              value={data.password}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-500"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Login
          </button>
          <div className="flex items-center justify-between mt-4">
            <label className="flex items-center text-sm text-gray-600">
              <input type="checkbox" className="mr-2" />
              Remember me for 7 days
            </label>
          </div>
          <div className="flex justify-between mt-4">
            <Link to="/forgot-password" className="text-sm text-blue-600 hover:text-blue-800">
              Forgot Password?
            </Link>
            <Link to="/register" className="text-sm text-blue-600 hover:text-blue-800">
              Create account?
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
