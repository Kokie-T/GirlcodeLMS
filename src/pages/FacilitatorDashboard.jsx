import React, { useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import ManageCourses from "./ManageCourses";
import ManageQuizzes from "./ManageQuizzes";
import ManageStudents from "./ManageStudents";
import ManageSubmissions from "./ManageSubmissions";
import {
  FaBook,
  FaQuestionCircle,
  FaUsers,
  FaCog,
  FaSignOutAlt,
  FaBars,
  FaTimes,
} from "react-icons/fa";


export default function FacilitatorDashboard() {
  const [activeTab, setActiveTab] = useState("courses");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "courses":
        return <ManageCourses />;
      case "quizzes":
        return <ManageQuizzes />;
      case "students":
        return <ManageStudents />;
      case "submissions":
        return <ManageSubmissions/>
      default:
        return <ManageCourses />;
    }
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div
       className={`fixed md:static top-0 left-0 h-full 
        bg-gradient-to-br from-blue-400 via-cyan-300 to-teal-200 
         text-white flex flex-col p-5 transform transition-transform 
         duration-300 ease-in-out z-50
         ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} 
         md:translate-x-0 w-60`}
         >

        {/* Close button on mobile */}
        <button
          className="md:hidden self-end text-2xl mb-4"
          onClick={() => setIsSidebarOpen(false)}
        >
          <FaTimes />
        </button>

        <h3 className="text-2xl font-bold text-center mb-8">Facilitator</h3>

        <button
          className={`flex items-center gap-3 px-4 py-2 rounded-lg mb-2 transition ${
            activeTab === "courses"
              ? "bg-white text-blue-600 font-semibold"
              : "hover:bg-white/20"
          }`}
          onClick={() => setActiveTab("courses")}
        >
          <FaBook /> Courses
        </button>

        <button
          className={`flex items-center gap-3 px-4 py-2 rounded-lg mb-2 transition ${
            activeTab === "quizzes"
              ? "bg-white text-blue-600 font-semibold"
              : "hover:bg-white/20"
          }`}
          onClick={() => setActiveTab("quizzes")}
        >
          <FaQuestionCircle /> Quizzes
        </button>

        <button
          className={`flex items-center gap-3 px-4 py-2 rounded-lg mb-2 transition ${
            activeTab === "students"
              ? "bg-white text-blue-600 font-semibold"
              : "hover:bg-white/20"
          }`}
          onClick={() => setActiveTab("students")}
        >
          <FaUsers /> Students
        </button>
        <button
          className={`flex items-center gap-3 px-4 py-2 rounded-lg mb-2 transition ${
            activeTab === "submissions"
              ? "bg-white text-blue-600 font-semibold"
              : "hover:bg-white/20"
          }`}
          onClick={() => setActiveTab("submissions")}
        >
          <FaUsers /> Submissions
        </button>

        <button
          className="flex items-center gap-3 px-4 py-2 rounded-lg mb-2 hover:bg-white/20 transition"
          onClick={() => navigate("/settings")}
        >
          <FaCog /> Settings
        </button>

        <div className="flex-grow" />

        <button
          className="flex items-center gap-3 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 transition"
          onClick={handleLogout}
        >
          <FaSignOutAlt /> Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 bg-gray-100 overflow-y-auto">
        {/* Mobile Menu Button */}
        <button
          className="md:hidden mb-4 p-2 bg-blue-500 text-white rounded-lg"
          onClick={() => setIsSidebarOpen(true)}
        >
          <FaBars />
        </button>

        <h2 className="text-2xl font-bold mb-4 capitalize">{activeTab}</h2>
        <div className="bg-white rounded-xl shadow p-5">{renderContent()}</div>
      </div>
    </div>
  );
}
