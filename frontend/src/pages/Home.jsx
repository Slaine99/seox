import React, { useState } from 'react'
import { useAuth } from "../context/authContext";
import { Link } from "react-router-dom";

// Navigation Bar for SEO-X
const SeoNav = () => {
  const { isAuthenticated } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all ${
        isScrolled ? "bg-white shadow-md" : "bg-transparent"
      }`}
    >
      <div className="max-w-screen-xl mx-auto flex items-center justify-between py-4 px-6">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <div className="text-2xl font-bold text-gray-800">
            <span className="text-[#0066CC]">SEO</span>
            <span className="text-[#00FFA6]">-X</span>
          </div>
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex gap-6 text-gray-700">
          <a href="#features" className="hover:text-[#0052A3] transition">
            Features
          </a>
          <a href="#pricing" className="hover:text-[#0052A3] transition">
            Pricing
          </a>
          <a href="#about" className="hover:text-[#0052A3] transition">
            About
          </a>
          <a href="#contact" className="hover:text-[#0052A3] transition">
            Contact
          </a>
        </div>

        {/* Login and CTA */}
        <div className="hidden md:flex gap-4">
          <Link
            to="/login"
            className="text-gray-700 hover:text-[#0052A3] transition"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="bg-[#00FFA6] text-white px-4 py-2 rounded-lg hover:bg-[#16A34A] transition"
          >
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
};

// Hero Section for SEO-X
const SeoHero = () => {
  return (
    <section className="relative bg-gradient-to-br from-blue-50 to-white min-h-screen flex items-center pt-20">
      <div className="max-w-screen-xl mx-auto px-6 lg:flex lg:items-center lg:gap-12">
        {/* Left Content */}
        <div className="lg:w-1/2 text-center lg:text-left">
          <div className="mb-6">
            <span className="inline-block bg-blue-100 text-blue-600 px-4 py-2 rounded-full text-sm font-medium mb-4">
              🚀 SEO Agency Management Platform
            </span>
          </div>
          <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Scale Your SEO Agency with{" "}
            <span className="text-[#0066CC]">SEO</span>
            <span className="text-[#00FFA6]">-X</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            The all-in-one platform that helps SEO agencies manage clients, 
            create content, track backlinks, and scale their business efficiently.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <Link
              to="/register"
              className="bg-[#0066CC] text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-[#0052A3] transition transform hover:scale-105"
            >
              Start Free Trial
            </Link>
            <Link
              to="#demo"
              className="border-2 border-[#0066CC] text-[#0066CC] px-8 py-4 rounded-lg font-semibold text-lg hover:bg-[#0066CC] hover:text-white transition"
            >
              Watch Demo
            </Link>
          </div>
          <div className="mt-8 flex items-center justify-center lg:justify-start gap-8 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              No Setup Fees
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              14-Day Free Trial
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Cancel Anytime
            </div>
          </div>
        </div>

        {/* Right Image/Dashboard Preview */}
        <div className="lg:w-1/2 mt-12 lg:mt-0 flex justify-center">
          <div className="relative">
            <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-lg">
              {/* Mock Dashboard */}
              <div className="border-b pb-4 mb-4">
                <h3 className="font-bold text-gray-800">SEO Agency Dashboard</h3>
                <p className="text-sm text-gray-600">Manage all your clients efficiently</p>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">24</div>
                  <div className="text-sm text-gray-600">Active Clients</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">147</div>
                  <div className="text-sm text-gray-600">Blog Posts</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">1.2K</div>
                  <div className="text-sm text-gray-600">Backlinks</div>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">$15K</div>
                  <div className="text-sm text-gray-600">Monthly Revenue</div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-sm">TechCorp Blog Post</span>
                  <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded">Published</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-sm">New Backlink Acquired</span>
                  <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">Active</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm">Client Report Generated</span>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">Sent</span>
                </div>
              </div>
            </div>
            {/* Floating Elements */}
            <div className="absolute -top-6 -right-6 bg-[#00FFA6] text-white px-4 py-2 rounded-lg text-sm font-medium">
              +50% Efficiency
            </div>
            <div className="absolute -bottom-6 -left-6 bg-[#0066CC] text-white px-4 py-2 rounded-lg text-sm font-medium">
              Save 20+ Hours/Week
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Features Section
const SeoFeatures = () => {
  const features = [
    {
      icon: "👥",
      title: "Client Management",
      description: "Organize all your SEO clients in one place with detailed profiles, project tracking, and communication history."
    },
    {
      icon: "📝",
      title: "Content Creation",
      description: "Built-in blog editor with SEO optimization tools, content calendar, and collaborative writing features."
    },
    {
      icon: "🔗",
      title: "Backlink Tracking",
      description: "Monitor and manage backlink campaigns with quality scoring, outreach templates, and progress tracking."
    },
    {
      icon: "📊",
      title: "Analytics & Reporting",
      description: "Comprehensive reporting dashboard with client-specific insights, ranking tracking, and automated reports."
    },
    {
      icon: "🔧",
      title: "White-Label Solution",
      description: "Fully customizable platform with your branding, custom domains, and client-facing portals."
    },
    {
      icon: "🚀",
      title: "Automation Tools",
      description: "Automate routine tasks like report generation, client onboarding, and progress notifications."
    }
  ];

  return (
    <section id="features" className="py-20 bg-white">
      <div className="max-w-screen-xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Everything You Need to Scale Your SEO Agency
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            From client management to content creation and backlink tracking, 
            SEO-X provides all the tools you need in one integrated platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-gray-50 p-8 rounded-xl hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Pricing Section
const SeoPricing = () => {
  const plans = [
    {
      name: "Starter",
      price: "$29",
      description: "Perfect for freelancers and small agencies",
      features: [
        "Up to 5 clients",
        "50 blog posts per month",
        "Basic backlink tracking",
        "Email support",
        "Standard templates"
      ],
      highlighted: false
    },
    {
      name: "Professional",
      price: "$79",
      description: "Best for growing SEO agencies",
      features: [
        "Up to 25 clients",
        "Unlimited blog posts",
        "Advanced backlink management",
        "Priority support",
        "White-label branding",
        "Custom reporting",
        "API access"
      ],
      highlighted: true
    },
    {
      name: "Enterprise",
      price: "$199",
      description: "For large agencies and teams",
      features: [
        "Unlimited clients",
        "Unlimited everything",
        "Dedicated account manager",
        "Custom integrations",
        "Advanced analytics",
        "Team collaboration tools",
        "Phone support"
      ],
      highlighted: false
    }
  ];

  return (
    <section id="pricing" className="py-20 bg-gray-50">
      <div className="max-w-screen-xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-600">
            Choose the plan that fits your agency's size and needs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div 
              key={index} 
              className={`bg-white p-8 rounded-xl ${plan.highlighted ? 'ring-2 ring-[#0066CC] relative' : ''} hover:shadow-lg transition-shadow`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-[#0066CC] text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-600 mb-4">{plan.description}</p>
                <div className="text-4xl font-bold text-gray-900 mb-1">
                  {plan.price}
                  <span className="text-lg font-normal text-gray-600">/month</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                to="/register"
                className={`block w-full text-center px-6 py-3 rounded-lg font-semibold transition ${
                  plan.highlighted
                    ? 'bg-[#0066CC] text-white hover:bg-[#0052A3]'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                }`}
              >
                Get Started
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// CTA Section
const SeoCTA = () => {
  return (
    <section className="py-20 bg-[#0066CC]">
      <div className="max-w-screen-xl mx-auto px-6 text-center">
        <h2 className="text-4xl font-bold text-white mb-4">
          Ready to Scale Your SEO Agency?
        </h2>
        <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
          Join hundreds of successful SEO agencies using SEO-X to streamline their operations 
          and grow their business faster than ever before.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/register"
            className="bg-[#00FFA6] text-gray-900 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-[#16A34A] hover:text-white transition"
          >
            Start Your Free Trial
          </Link>
          <Link
            to="/login"
            className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-[#0066CC] transition"
          >
            Sign In
          </Link>
        </div>
        <p className="text-blue-200 mt-6 text-sm">
          No credit card required • 14-day free trial • Cancel anytime
        </p>
      </div>
    </section>
  );
};

// Footer
const SeoFooter = () => {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-screen-xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="text-2xl font-bold mb-4">
              <span className="text-[#0066CC]">SEO</span>
              <span className="text-[#00FFA6]">-X</span>
            </div>
            <p className="text-gray-400">
              The all-in-one platform for SEO agencies to manage clients, 
              create content, and scale their business.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#features" className="hover:text-white transition">Features</a></li>
              <li><a href="#pricing" className="hover:text-white transition">Pricing</a></li>
              <li><Link to="/login" className="hover:text-white transition">Login</Link></li>
              <li><Link to="/register" className="hover:text-white transition">Sign Up</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#about" className="hover:text-white transition">About</a></li>
              <li><a href="#contact" className="hover:text-white transition">Contact</a></li>
              <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition">Terms of Service</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white transition">Help Center</a></li>
              <li><a href="#" className="hover:text-white transition">Documentation</a></li>
              <li><a href="#" className="hover:text-white transition">API Reference</a></li>
              <li><a href="#contact" className="hover:text-white transition">Contact Support</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 SEO-X. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

const Home = () => {
  const { isAuthenticated } = useAuth();

  // If user is authenticated, redirect them to the dashboard
  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Welcome back!</h1>
          <Link 
            to="/dashboard" 
            className="bg-[#0066CC] text-white px-6 py-3 rounded-lg hover:bg-[#0052A3] transition"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <SeoNav />
      <SeoHero />
      <SeoFeatures />
      <SeoPricing />
      <SeoCTA />
      <SeoFooter />
    </div>
  );
};

export default Home;
