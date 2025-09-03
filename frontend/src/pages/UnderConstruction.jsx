import React from "react";
import { useProfile } from "../context/profileContext";
import Nav from "/src/components/Chat/Nav.jsx"; // Reuse your updated Nav
import constructionImage from "/src/assets/construction.png"; // Replace with your under construction image
import notificationIcon from "/src/assets/notifications.png"; // Placeholder for bell icon
import userIcon from "/src/assets/user-icon.png"; // Placeholder for user profile image

const UnderConstruction = () => {
  const { userDetails } = useProfile();
  const firstName = userDetails?.firstName || "User";

  return (
    <div className="flex min-h-screen bg-[#FAFBFF]">
      {/* Sidebar Navigation */}
      <Nav />

      {/* Main Content */}
      <div className="flex-1 flex flex-col p-6">
        {/* Top Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            Welcome <span className="text-[#008CFF]">{firstName}</span>!
          </h1>
          <div className="flex items-center space-x-6">
            {/* Notification Icon */}
            <div className="relative">
              <img
                src={notificationIcon}
                alt="Notifications"
                className="w-6 h-6 cursor-pointer"
              />
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full px-1">
                2
              </span>
            </div>

            {/* User Profile */}
            <div className="flex items-center">
              <img
                src={userIcon}
                alt="User Profile"
                className="w-8 h-8 rounded-full border border-gray-300"
              />
            </div>
          </div>
        </div>

        {/* Under Construction Content */}
        <div className="flex flex-col items-center justify-center h-full">
          <img
            src={constructionImage}
            alt="Under Construction"
            className="w-60 h-60 mb-8"
          />
          <h1 className="text-4xl font-bold text-[#008CFF] mb-4">
            Page Under Construction
          </h1>
          <p className="text-gray-700 text-lg mb-6 text-center">
            We're working hard to bring you something amazing. <br />
            Please check back soon!
          </p>
          <button
            onClick={() => window.history.back()}
            className="bg-[#008CFF] text-white px-6 py-3 rounded-lg hover:bg-[#007ACC] transition-all duration-300"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnderConstruction;
