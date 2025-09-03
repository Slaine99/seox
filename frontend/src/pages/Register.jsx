import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  useEffect(() => {
    // Check if this is a client invitation
    const invitationToken = searchParams.get('invitation');
    const token = searchParams.get('token');
    
    if (invitationToken || token) {
      // Redirect to client registration
      const finalToken = invitationToken || token;
      toast.info('Redirecting to client registration...');
      navigate(`/client/register/${finalToken}`, { replace: true });
      return;
    }
  }, [navigate, searchParams]);

  const [data, setData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "Agency"
  });

  const handleChange = (e) =>
    setData({ ...data, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data: res } = await axios.post("/api/user/register", data);
      toast.success(res.message);
  
      // Check if the payment URL is provided
      if (res.paymentUrl) {
        window.location.href = res.paymentUrl; // Redirect the user to the Mollie payment page
      } else {
        // Since we're removing the subscription plan, we might not need a payment URL anymore
        // Redirect to login or home page instead
        window.location.href = "/login";
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
      {/* Header with logo */}
      <div className="mb-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-blue-600">SEO-X</h1>
          <p className="text-sm text-gray-500">SEO Management Platform</p>
        </div>
      </div>

      {/* Registration Section */}
      <div className="text-center max-w-lg mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Create SEO Account
        </h1>
        <p className="text-gray-600 mb-8">
          Join the SEO-X Platform
        </p>

        {/* Registration Form */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="firstName"
                className="block text-sm font-medium text-gray-700"
              >
                First Name
              </label>
              <input
                type="text"
                name="firstName"
                id="firstName"
                placeholder="First Name"
                value={data.firstName}
                onChange={handleChange}
                className="w-full p-3 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label
                htmlFor="lastName"
                className="block text-sm font-medium text-gray-700"
              >
                Last Name
              </label>
              <input
                type="text"
                name="lastName"
                id="lastName"
                placeholder="Last Name"
                value={data.lastName}
                onChange={handleChange}
                className="w-full p-3 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email Address
              </label>
              <input
                type="email"
                name="email"
                id="email"
                placeholder="Email Address"
                value={data.email}
                onChange={handleChange}
                className="w-full p-3 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <input
                type="password"
                name="password"
                id="password"
                placeholder="Password"
                value={data.password}
                onChange={handleChange}
                className="w-full p-3 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label
                htmlFor="role"
                className="block text-sm font-medium text-gray-700"
              >
                Role
              </label>
              <select
                name="role"
                id="role"
                value={data.role}
                onChange={handleChange}
                className="w-full p-3 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="Agency">Agency</option>
                <option value="Client">Client</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Create SEO Account
            </button>
          </form>

          <p className="text-xs text-gray-500 mt-4">
            By clicking 'Create SEO Account' you agree to our{" "}
            <a href="#" className="text-blue-600 hover:text-blue-800">
              terms
            </a>
            . This form is protected by Google reCAPTCHA:{" "}
            <a href="#" className="text-blue-600 hover:text-blue-800">
              privacy
            </a>
            ,{" "}
            <a href="#" className="text-blue-600 hover:text-blue-800">
              terms
            </a>
            .
          </p>
        </div>

        {/* Login Link */}
        <div className="mt-8">
          <p className="text-gray-600">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-600 hover:text-blue-800 font-semibold">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;