import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/authContext";
import axios from "axios";
import Calendar from 'react-calendar'; // Import the calendar component
import 'react-calendar/dist/Calendar.css'; // Import calendar styles

// Navigation Bar
const LandingNav = () => {
  const { isAuthenticated } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [appointmentDate, setAppointmentDate] = useState(new Date());
  const [appointmentTime, setAppointmentTime] = useState('10:00');
  const [appointmentType, setAppointmentType] = useState('introductory');
  const [appointmentDetails, setAppointmentDetails] = useState('');
  const [needsCleanout, setNeedsCleanout] = useState(false); // Add this state
  const [contactInfo, setContactInfo] = useState({ name: '', email: '', phone: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState({ type: "", text: "" });
  
  const appointmentTypes = [
    { id: 'introductory', name: 'Introductory Meeting', duration: 15 },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleContactChange = (e) => {
    const { name, value } = e.target;
    setContactInfo({
      ...contactInfo,
      [name]: value
    });
  };

  const handleSubmitAppointment = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const selectedType = appointmentTypes.find(type => type.id === appointmentType);
    
    try {
      // Prepare appointment data
      const appointmentData = {
        appointmentDate: appointmentDate.toISOString().split('T')[0],
        appointmentTime,
        appointmentType: selectedType.name,
        duration: selectedType.duration,
        details: appointmentDetails,
        needsCleanout: needsCleanout, // Add this field
        contactName: contactInfo.name,
        contactEmail: contactInfo.email,
        contactPhone: contactInfo.phone,
        ownerEmail: 'phaophaoespina@gmail.com' // The owner's email
      };
      
      console.log("Sending appointment data:", appointmentData);
      
      // Send appointment data to your backend (use absolute URL for debugging)
      const response = await axios.post('/api/appointments/schedule', appointmentData);
      console.log("Appointment response:", response.data);
      
      setSubmitMessage({
        type: "success",
        text: "Successfully requested an appointment, we will send you an invite after we finalize the appointment on our end."
      });

      // Keep the success message visible longer
      setTimeout(() => {
        setShowAppointmentModal(false);
        setSubmitMessage({ type: "", text: "" });
        setAppointmentDate(new Date());
        setAppointmentTime('10:00');
        setAppointmentType('introductory');
        setAppointmentDetails('');
        setNeedsCleanout(false); // Reset this field too
        setContactInfo({ name: '', email: '', phone: '' });
      }, 5000); // 5 seconds
    } catch (error) {
      console.error("Error scheduling appointment:", error);
      setSubmitMessage({
        type: "error",
        text: "Error scheduling appointment. Please try again."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
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
            <button 
              onClick={() => setShowAppointmentModal(true)}
              className="hover:text-[#0052A3] transition"
            >
              Schedule a Demo
            </button>
            <Link to="/features" className="hover:text-[#0052A3] transition">
              Features
            </Link>
            <Link to="/pricing" className="hover:text-[#0052A3] transition">
              Pricing
            </Link>
            <Link to="/resources" className="hover:text-[#0052A3] transition">
              Resources
            </Link>
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
              Register
            </Link>
          </div>
        </div>
      </nav>

      {/* Appointment Modal */}
      {showAppointmentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Schedule a Key Pickup</h2>
                <button 
                  onClick={() => setShowAppointmentModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {submitMessage.text && (
                <div className={`mb-4 p-3 rounded flex items-center ${submitMessage.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                  {submitMessage.type === "success" && (
                    <div className="mr-3 flex-shrink-0">
                      <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                  <p>{submitMessage.text}</p>
                </div>
              )}

              <form onSubmit={handleSubmitAppointment}>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Appointment Type</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {appointmentTypes.map((type) => (
                      <div 
                        key={type.id}
                        className={`p-4 border rounded-lg cursor-pointer transition ${
                          appointmentType === type.id 
                            ? 'bg-[#e6fff6] border-[#00FFA6]' 
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                        onClick={() => setAppointmentType(type.id)}
                      >
                        <div className="font-medium text-gray-800">{type.name}</div>
                        <div className="text-sm text-gray-500">{type.duration} minutes</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Date</label>
                  <div className="border border-gray-300 rounded-lg p-2">
                    <Calendar
                      onChange={setAppointmentDate}
                      value={appointmentDate}
                      minDate={new Date()}
                      className="rounded-lg"
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Time</label>
                  <select
                    value={appointmentTime}
                    onChange={(e) => setAppointmentTime(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                  >
                    {['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'].map(time => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
                    <input
                      type="text"
                      name="name"
                      value={contactInfo.name}
                      onChange={handleContactChange}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={contactInfo.email}
                      onChange={handleContactChange}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={contactInfo.phone}
                      onChange={handleContactChange}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Additional Details (Optional)</label>
                    <textarea
                      name="details"
                      value={appointmentDetails}
                      onChange={(e) => setAppointmentDetails(e.target.value)}
                      rows="3"
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="Please share any specific questions or information about your property or situation."
                    ></textarea>
                  </div>
                </div>

                <div className="md:col-span-2 mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">Does the House Need to be cleaned out?</label>
                  <div className="flex gap-6">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="needsCleanout"
                        value="yes"
                        checked={needsCleanout === true}
                        onChange={() => setNeedsCleanout(true)}
                        className="mr-2 h-4 w-4 text-[#00FFA6] focus:ring-[#00FFA6] border-gray-300"
                      />
                      <span className="text-gray-700">Yes</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="needsCleanout"
                        value="no"
                        checked={needsCleanout === false}
                        onChange={() => setNeedsCleanout(false)}
                        className="mr-2 h-4 w-4 text-[#00FFA6] focus:ring-[#00FFA6] border-gray-300"
                      />
                      <span className="text-gray-700">No</span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowAppointmentModal(false)}
                    className="mr-3 px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`px-6 py-2 bg-[#00FFA6] text-white rounded-lg hover:bg-[#16A34A] transition ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    {isSubmitting ? 'Scheduling...' : 'Schedule Appointment'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Hero Section
const Hero = () => {
  // Add state for modal visibility
  const [showPropertyModal, setShowPropertyModal] = useState(false);
  // Add state for form data
  const [propertyFormData, setPropertyFormData] = useState({
    propertyAddress: "",
    propertyCity: "",
    propertyState: "",
    propertyZip: "",
    propertyType: "residential",
    propertyCondition: "good",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    additionalInfo: ""
  });
  // Add state for form submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState({ type: "", text: "" });

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPropertyFormData({
      ...propertyFormData,
      [name]: value
    });
  };

  // Handle form submission
  const handleSubmitProperty = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await axios.post("/api/properties/submit", propertyFormData);
      setSubmitMessage({
        type: "success",
        text: "Property submitted successfully! We'll contact you soon."
      });
      
      // Reset form after successful submission
      setTimeout(() => {
        setShowPropertyModal(false);
        setSubmitMessage({ type: "", text: "" });
        setPropertyFormData({
          propertyAddress: "",
          propertyCity: "",
          propertyState: "",
          propertyZip: "",
          propertyType: "residential",
          propertyCondition: "good",
          contactName: "",
          contactEmail: "",
          contactPhone: "",
          additionalInfo: ""
        });
      }, 3000);
    } catch (error) {
      setSubmitMessage({
        type: "error",
        text: "Error submitting property. Please try again."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      className="relative bg-white min-h-screen flex items-center"
      style={{
        backgroundImage: `url('/src/assets/HeroBG.png')`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'contain',
        backgroundPosition: 'left',
      }}
    >
      <div className="max-w-screen-xl mx-auto px-6 lg:flex lg:items-center lg:gap-10">
        {/* Left Content */}
        <div className="lg:w-1/2 text-center lg:text-left">
          <h1 className="text-6xl lg:text-5xl font-bold text-gray-800 mb-4">
          For agencies        </h1>
          <div className="flex justify-center lg:justify-start gap-4">
            <Link
              to="/register"
              className="bg-[#00FFA6] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#16A34A] transition"
            >
              Register
            </Link>

          </div>
          <p className="text-gray-500 mt-4">
            Trusted by software reviews{" "}
            <span className="font-bold text-gray-700">— Autopilot</span>
          </p>
        </div>

        {/* Right Image */}
        <div className="lg:w-1/2 mt-8 lg:mt-0 flex justify-center relative">
          <div className="relative rounded-3xl overflow-hidden">
            <img
              src="/src/assets/rightimage1.png"
              alt="Dashboard Preview"
              className="rounded-3xl shadow-lg block"
            />
          </div>
        </div>
      </div>

      {/* Property Submission Modal */}
      {showPropertyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Submit Property For Sale</h2>
                <button 
                  onClick={() => setShowPropertyModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {submitMessage.text && (
                <div className={`mb-4 p-3 rounded ${submitMessage.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                  {submitMessage.text}
                </div>
              )}

              <form onSubmit={handleSubmitProperty}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Property Address</label>
                    <input
                      type="text"
                      name="propertyAddress"
                      value={propertyFormData.propertyAddress}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input
                      type="text"
                      name="propertyCity"
                      value={propertyFormData.propertyCity}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                    <input
                      type="text"
                      name="propertyState"
                      value={propertyFormData.propertyState}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
                    <input
                      type="text"
                      name="propertyZip"
                      value={propertyFormData.propertyZip}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
                    <select
                      name="propertyType"
                      value={propertyFormData.propertyType}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      required
                    >
                      <option value="residential">Residential</option>
                      <option value="commercial">Commercial</option>
                      <option value="land">Land</option>
                      <option value="multiFamily">Multi-Family</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Property Condition</label>
                    <select
                      name="propertyCondition"
                      value={propertyFormData.propertyCondition}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      required
                    >
                      <option value="excellent">Excellent</option>
                      <option value="good">Good</option>
                      <option value="fair">Fair</option>
                      <option value="needsWork">Needs Work</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
                    <input
                      type="text"
                      name="contactName"
                      value={propertyFormData.contactName}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      name="contactEmail"
                      value={propertyFormData.contactEmail}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      name="contactPhone"
                      value={propertyFormData.contactPhone}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Additional Information</label>
                    <textarea
                      name="additionalInfo"
                      value={propertyFormData.additionalInfo}
                      onChange={handleInputChange}
                      rows="4"
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="Any specific details about the property you want to share..."
                    ></textarea>
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowPropertyModal(false)}
                    className="mr-3 px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`px-6 py-2 bg-[#00FFA6] text-white rounded-lg hover:bg-[#16A34A] transition ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Property'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

// Features Section
const Features = () => (
  <section className="py-16 bg-white">
    <div className="max-w-screen-xl mx-auto px-6 bg-blue-50 rounded-3xl shadow-md p-10 relative">
      {/* Header */}
      <h2 className="text-center text-4xl font-extrabold text-gray-800 mb-2">
        What We Offer
      </h2>
      <p className="text-center text-lg font-light text-gray-600 mb-10">
      Comprehensive Solutions for Guardians, Executors & Attorneys
      </p>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
        {/* Left Features */}
        <div className="grid grid-rows-[auto_auto_auto] gap-6">
          {/* Top Row: Two Features */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
  {[
    {
      title: "Effortless Property Management",
      description:
        "Easily upload property details, court documents, and manage tasks in one secure platform designed for estate realty cases.",
      icon: "/src/assets/filem.png",  // Changed to image path
    },
    {
      title: "Smart Scheduling & Notifications",
      description:
        "Schedule key pickups, cleanouts, and get real-time updates on every step — from photos taken to offers received.",
      icon: "/src/assets/calendar.png",  // Changed to image path
    },
  ].map((feature, idx) => (
    <div
      key={idx}
      className="p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition flex flex-col items-center text-center"
    >
      <div className="mb-5">
        <img 
          src={feature.icon} 
          alt={feature.title} 
          className="w-16 h-16 object-contain"
        />
      </div>
      <h3 className="text-xl font-semibold text-gray-800 mb-2">
        {feature.title}
      </h3>
      <p className="text-base text-gray-600">{feature.description}</p>
    </div>
  ))}
</div>

          {/* Bottom Row: Single Feature */}
{/* Bottom Row: Single Feature */}
<div className="p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition flex flex-col items-center text-center">
  <div className="mb-5">
    <img 
      src="/src/assets/secure.png" 
      alt="Secure Collaboration" 
      className="w-16 h-16 object-contain"
    />
  </div>
  <h3 className="text-xl font-semibold text-gray-800 mb-2">
    Secure Collaboration Portal
  </h3>
  <p className="text-base text-gray-600">
    Role-based access for Guardians, Executors, Attorneys, and Agents — enabling smooth communication and transparency in managing estate properties.
  </p>
</div>
        </div>

        {/* Right Image */}
        <div className="flex justify-center items-center">
          <img
            src="/src/assets/clientmng1.png" // Replace with your actual image
            alt="Professional working"
            className="rounded-lg shadow-md bg-white"
          />
        </div>
      </div>
    </div>
  </section>
);


// Discover Section
const Discover = () => (
  <section className="py-16 bg-white">
    <div className="max-w-screen-xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-[5fr_3fr] gap-0 lg:gap-12 items-start">
      {/* Left Content */}
      <div className="lg:max-w-lg flex flex-col justify-center">
        <h2 className="text-5xl font-extrabold text-gray-800 mb-6 leading-tight">
          Discover How We <br />
          <span className="block">Can Help You</span>
        </h2>
        <p className="text-lg text-gray-600 mb-8 leading-relaxed">
        Managing Estate Properties Has Never Been Easier. Seamlessly handle real estate transactions for guardianship, executors, and attorneys — all in one platform.
        
  <br></br>      
    <br></br>   
For court-appointed guardians, estate administrators and ambitious Agents who need help with legally complex real estate, Guardianship and Estate Realty is a specialized Real Estate Company that simplifies complex real estate transactions, handles logistics and guarantees peace of mind from start to finish. Unlike generic Real Estate Agents, we offer a seamless, end-to-end, stress free experience.

        
        </p>
        <div className="rounded-lg overflow-hidden shadow-md">
          <img
            src="/src/assets/discoverleft.png" // Replace with your actual image path
            alt="Discover Help"
            className="w-full h-auto object-cover"
          />
        </div>
      </div>

      {/* Right Cards */}
      <div className="flex flex-col justify-start gap-8">
  {[
    {
      title: "Submit Property Details",
      description: "Easily submit essential property information, upload court documents, and kickstart the process effortlessly.",
      icon: "/src/assets/submitpropertydetails.png",
    },
    {
      title: "Schedule Key Pickups & Cleanouts",
      description: "Book appointments for key pickup or cleanout services at your convenience — with real-time updates every step of the way.",
      icon: "/src/assets/schedulekeypickups.png",
      highlighted: true,
    },
    {
      title: "Stay Informed & In Control",
      description: "Receive instant notifications about agent handoffs, offers received, photos taken, and closing updates — so you're always in the loop.",
      icon: "/src/assets/stayinformed.png",
    },
  ].map((item, idx) => (
    <div
      key={idx}
      className={`p-5 shadow-lg flex items-center gap-4 hover:shadow-xl transition rounded-lg ${
        item.highlighted 
          ? "bg-[#e6fff6] border-2 border-[#00FFA6]/30" 
          : "bg-white"
      }`}
    >
      <div className="flex items-center">
        <img
          src={item.icon}
          alt={item.title}
          className="w-16 h-16 object-contain"
        />
      </div>
      <div>
        <h3 className="text-xl font-semibold text-gray-800">
          {item.title}
        </h3>
        <p className="text-sm text-gray-600">{item.description}</p>
      </div>
    </div>
  ))}
</div>

    </div>
  </section>
);



// Pricing Section
const Pricing = () => (
  <section className="bg-[#F3F9FF] py-16">
    <div className="max-w-screen-xl mx-auto px-6">
      {/* Header */}
      <h2 className="text-center text-4xl font-extrabold text-gray-800 mb-8">
        Pricing
      </h2>

      {/* Monthly / Yearly Toggle */}
      <div className="flex justify-center mb-12">
        <button className="px-6 py-2 text-sm font-medium text-white bg-[#00FFA6] rounded-l-lg shadow-md">
          Monthly
        </button>
        <button className="px-6 py-2 text-sm font-medium text-gray-800 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-100 transition">
          Yearly
        </button>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          {
            title: "Freebie",
            price: "$0",
            description: "Ideal for individuals who need quick access to basic features.",
            features: [
              "Lorem ipsum dolor amet consectetur",
              "Lorem ipsum dolor amet consectetur",
              "",
              "",
            ],
          },
          {
            title: "Professional",
            price: "$25",
            description: "Ideal for individuals who need advanced tools.",
            features: [
              "Lorem ipsum dolor amet consectetur",
              "Lorem ipsum dolor amet consectetur",
              "Lorem ipsum dolor amet consectetur",
              "Lorem ipsum dolor amet consectetur",
              "Lorem ipsum dolor amet consectetur",
            ],
          },
          {
            title: "Enterprise",
            price: "$100",
            description: "Ideal for businesses who need personalized solutions.",
            features: [
              "Lorem ipsum dolor amet consectetur",
              "Lorem ipsum dolor amet consectetur",
              "Lorem ipsum dolor amet consectetur",
              "Lorem ipsum dolor amet consectetur",
              "Lorem ipsum dolor amet consectetur",
            ],
          },
        ].map((plan, idx) => (
          <div
            key={idx}
            className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition relative"
          >
            {/* Plan Title */}
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              {plan.title}
            </h3>

            {/* Plan Description */}
            <p className="text-sm text-gray-600 mb-6">{plan.description}</p>

            {/* Price */}
            <p className="text-5xl font-extrabold text-gray-800 mb-6">
              {plan.price}
              <span className="text-lg font-medium text-gray-600"> / Month</span>
            </p>

            {/* Get Started Button */}
            <button className="w-full bg-[#00FFA6] text-white py-3 rounded-lg font-medium hover:bg-[#16A34A] transition">
              Get Started Now
            </button>

            {/* Features */}
            <ul className="mt-6 space-y-4">
              {plan.features.map((feature, idx) => (
                <li
                  key={idx}
                  className={`flex items-center ${
                    feature ? "text-gray-700" : "text-gray-400"
                  }`}
                >
                  <div
                    className={`flex items-center justify-center w-6 h-6 rounded-full mr-3 ${
                      feature ? "bg-gray-800" : "bg-gray-300"
                    }`}
                  >
                    {feature ? (
                      <svg
                        className="w-4 h-4 text-[#00FFA6]"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-4 h-4 text-gray-500"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </div>
                  <span>{feature || "Unavailable Feature"}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  </section>
);



// Footer Section
const Footer = () => (
  <>
    {/* White Background Spacer */}
    <div className="bg-white py-28"></div> {/* Creates separation above the floater */}

    {/* Floating Section */}
    <div className="relative bg-white">
      <div className="absolute inset-x-0 -top-28 mx-auto max-w-screen-lg"> {/* Floating rectangle */}
        <div className="bg-[#007BFF] text-center py-12 px-10 rounded-xl shadow-lg">
          <h3 className="text-3xl font-bold text-white mb-6">
          We're Here To Help You Navigate Estate Real Estate with Ease
          </h3>
          <p className="text-lg text-white mb-8">
          Managing properties during guardianship or estate processes can be overwhelming — we're here to simplify it for you every step of the way.  </p>
          <button className="bg-[#00FFA6] text-white font-medium py-3 px-8 rounded-lg hover:bg-[#16A34A] transition">
            Join Community →
          </button>
        </div>
      </div>
    </div>

    {/* Black Footer Section */}
    <footer className="bg-[#1A1A1A] text-white pt-60 pb-12"> {/* Increased spacing with `pt-60` */}
      <div className="max-w-screen-xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-3 gap-8">
        {/* Logo Section */}
        <div>
          <img
      src="/src/assets/gerlogo.png" // Replace with the actual path to your logo file
      alt="Kraam Contract Logo"
            className="w-32 mb-4"
          />
          <p className="text-gray-400">
          Simplifying Complex Real Estate for Guardians, Executors & Agents.          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-lg font-semibold text-white mb-4">Quick Links</h4>
          <ul className="space-y-2">
            {["Lorem Ipsum", "Lorem Ipsum", "Lorem Ipsum", "Lorem Ipsum"].map(
              (link, idx) => (
                <li key={idx}>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition"
                  >
                    {link}
                  </a>
                </li>
              )
            )}
          </ul>
        </div>

        {/* Help & Newsletter */}
        <div>
          <h4 className="text-lg font-semibold text-white mb-4">Help & Support</h4>
          <ul className="space-y-2 mb-6">
            {["FAQs", "Privacy Policy", "Terms of Services"].map((link, idx) => (
              <li key={idx}>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition"
                >
                  {link}
                </a>
              </li>
            ))}
          </ul>
          <h4 className="text-lg font-semibold text-white mb-4">Newsletter</h4>
          <div className="flex items-center gap-2">
            <input
              type="email"
              placeholder="Email Address"
              className="flex-grow p-3 rounded-lg bg-gray-800 text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#007BFF]"
            />
            <button className="bg-[#00FFA6] text-white p-3 rounded-lg hover:bg-[#16A34A] transition">
              →
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Section */}

    </footer>
    <div className="bg-[#0F0F0F] py-4 text-center text-sm text-gray-400">
        <p>© 2024 All Rights Reserved.</p>
      </div>
  </>
);



// Landing Page
const LandingPage = () => (
  <div>
    <LandingNav />
    <Hero />
    {/* <Features />
    <Discover />

    <Pricing />
    <Footer /> */}
  </div>
);

export default LandingPage;
