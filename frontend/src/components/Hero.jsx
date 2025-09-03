import { Link } from "react-router-dom";
import hero from "../assets/hero.png";
import { useAuth } from "../context/authContext";
import LandingNav from "../components/LandingNav";

const Hero = () => {
  const { isAuthenticated } = useAuth();
  return (
    <div className="bg-[#6C5DD3] text-white min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
      <LandingNav />
      <div className="text-center mt-12">
        <h1 className="text-4xl sm:text-6xl font-bold mb-6">
        MaternityX
        </h1>
        <p className="text-lg sm:text-xl mb-8">
          <span className="inline-flex items-center">
            <svg
              className="w-6 h-6 mr-2 text-green-500"
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
            GPT5 Based
          </span>
          <br />
          <span className="inline-flex items-center">
            <svg
              className="w-6 h-6 mr-2 text-green-500"
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
            Checkpoints
          </span>
          <br />
          <span className="inline-flex items-center">
            <svg
              className="w-6 h-6 mr-2 text-green-500"
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
            LMV AI Model
          </span>
          <br />
          <span className="inline-flex items-center">
            <svg
              className="w-6 h-6 mr-2 text-green-500"
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
            335 LLMS
          </span>
        </p>
        <div className="bg-[#FFD700] rounded-lg p-8 max-w-2xl mx-auto mt-8">
          <p className="text-xl sm:text-2xl italic font-semibold mb-4">
            "I am feeling way more healthier"
          </p>
          <p className="text-lg font-medium">
            - James D Fuller
          </p>
          <p className="text-sm text-gray-400">
            Creative Designer, Meta LLC
          </p>
        </div>
      </div>
    </div>
  );
};
export default Hero;
