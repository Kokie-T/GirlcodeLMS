import React, { useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import Overview from "./Reports";
import UsersManagement from "./UsersManagement";
import FacilitatorsManagement from "./FacilitatorsManagement";
import CoursesManagement from "./ContentManagement";
import SystemSettings from "./SystemSettings";

import {
  FaUsers,
  FaUserTie,
  FaBook,
  FaCog,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaChartBar,
} from "react-icons/fa";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
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
      case "overview":
        return <div>📊 <Overview /></div>;
      case "users":
        return <div>👥 <UsersManagement /></div>;
      case "facilitators":
        return <div>👨‍🏫 <FacilitatorsManagement /></div>;
      case "courses":
        return <div>📚 <CoursesManagement /></div>;
      case "settings":
        return <div>⚙️ <SystemSettings /></div>;
      default:
        return <div>📊 <Overview /></div>;
    }
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div
        className={`fixed md:static top-0 left-0 h-full bg-gradient-to-br from-indigo-500 to-purple-400 text-white flex flex-col p-5 transform transition-transform duration-300 z-50
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 w-64`}
      >
        {/* Close button on mobile */}
        <button
          className="md:hidden self-end text-2xl mb-4"
          onClick={() => setIsSidebarOpen(false)}
        >
          <FaTimes />
        </button>

        <h3 className="text-2xl font-bold text-center mb-8">Admin</h3>

        <button
          className={`flex items-center gap-3 px-4 py-2 rounded-lg mb-2 transition ${
            activeTab === "overview"
              ? "bg-white text-indigo-600 font-semibold"
              : "hover:bg-white/20"
          }`}
          onClick={() => setActiveTab("overview")}
        >
          <FaChartBar /> Overview
        </button>

        <button
          className={`flex items-center gap-3 px-4 py-2 rounded-lg mb-2 transition ${
            activeTab === "users"
              ? "bg-white text-indigo-600 font-semibold"
              : "hover:bg-white/20"
          }`}
          onClick={() => setActiveTab("users")}
        >
          <FaUsers /> Users
        </button>

        <button
          className={`flex items-center gap-3 px-4 py-2 rounded-lg mb-2 transition ${
            activeTab === "facilitators"
              ? "bg-white text-indigo-600 font-semibold"
              : "hover:bg-white/20"
          }`}
          onClick={() => setActiveTab("facilitators")}
        >
          <FaUserTie /> Facilitators
        </button>

        <button
          className={`flex items-center gap-3 px-4 py-2 rounded-lg mb-2 transition ${
            activeTab === "courses"
              ? "bg-white text-indigo-600 font-semibold"
              : "hover:bg-white/20"
          }`}
          onClick={() => setActiveTab("courses")}
        >
          <FaBook /> Courses
        </button>

        <button
          className={`flex items-center gap-3 px-4 py-2 rounded-lg mb-2 transition ${
            activeTab === "settings"
              ? "bg-white text-indigo-600 font-semibold"
              : "hover:bg-white/20"
          }`}
          onClick={() => setActiveTab("settings")}
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
      <div className="flex-1 p-6 bg-gray-50 overflow-y-auto">
        {/* Mobile Menu Button */}
        <button
          className="md:hidden mb-4 p-2 bg-indigo-500 text-white rounded-lg"
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
