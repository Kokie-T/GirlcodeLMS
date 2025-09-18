import React, { useState, useEffect } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";

import Overview from "./Overview";
import UsersManagement from "./UsersManagement";
import CoursesManagement from "./ContentManagement";
import SystemSettings from "./SystemSettings";
import ReportsPage from "./Reports";
import MessagesPage from "./MessagesPage";

import {
  FaUsers,
  FaUserTie,
  FaBook,
  FaCog,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaChartBar,
  FaEnvelope,
} from "react-icons/fa";

// Overlay for modals
const Overlay = ({ children, onClose }) => (
  <div
    className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
    onClick={onClose}
  >
    <div
      className="bg-white dark:bg-gray-800 rounded-xl p-6 w-96 shadow-lg"
      onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
    >
      {children}
    </div>
  </div>
);

// Logout confirmation popup
const LogoutPopup = ({ onConfirm, onCancel }) => (
  <Overlay onClose={onCancel}>
    <h2 className="text-lg font-semibold mb-4 dark:text-white">👋 Confirm Logout</h2>
    <p className="mb-6 dark:text-gray-300">
      Are you sure you want to log out?
    </p>
    <div className="flex justify-end gap-3">
      <button
        onClick={onCancel}
        className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 transition"
      >
        Cancel
      </button>
      <button
        onClick={onConfirm}
        className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600 transition"
      >
        Logout
      </button>
    </div>
  </Overlay>
);

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [adminEmail, setAdminEmail] = useState("");
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);
  const navigate = useNavigate();

  // Get current admin email
  useEffect(() => {
    if (auth.currentUser) {
      setAdminEmail(auth.currentUser.email);
    }
  }, []);

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
        return (
          <div>
            {/* Welcome Message */}
            <div className="bg-gradient-to-r from-blue-100 to-blue-200 rounded-xl shadow-md p-4 mb-6">
              <h3 className="text-lg font-semibold text-gray-800">
                👋 Welcome back, {auth.currentUser?.displayName || adminEmail?.split("@")[0] || "Admin"}!
              </h3>
              <p className="text-gray-700">
                Here’s an overview of your Portal. Manage students, facilitators, courses, and more from the sidebar.
              </p>
            </div>
            <Overview />
          </div>
        );
      case "users":
        return <UsersManagement />;
      case "courses":
        return <CoursesManagement />;
      case "reports":
        return <ReportsPage />;
      case "messages":
        return <MessagesPage />;
      case "settings":
        return <SystemSettings />;
      default:
        return <Overview />;
    }
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div
        className={`fixed md:static top-0 left-0 h-full bg-gradient-to-br from-blue-600 to-teal-500 text-white flex flex-col p-5 transform transition-transform duration-300 z-50
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 w-64`}
      >
        {/* Close button on mobile */}
        <button
          className="md:hidden self-end text-2xl mb-4"
          onClick={() => setIsSidebarOpen(false)}
        >
          <FaTimes />
        </button>

        {/* LMS Pro + Admin Portal */}
        <div className="text-center mb-8">
          <h1 className="text-xl font-bold">LMS Pro</h1>
          <h2 className="text-sm font-medium mt-1">Admin Portal</h2>
        </div>

        {/* Sidebar buttons */}
        {[
          { key: "overview", icon: <FaChartBar />, label: "Overview" },
          { key: "users", icon: <FaUsers />, label: "Users" },
          { key: "courses", icon: <FaBook />, label: "Courses" },
          { key: "messages", icon: <FaEnvelope />, label: "Messages" },
          { key: "reports", icon: <FaBook />, label: "Reports" },
          { key: "settings", icon: <FaCog />, label: "Settings" },
        ].map((item) => (
          <button
            key={item.key}
            className={`flex items-center gap-3 px-4 py-2 rounded-lg mb-2 transition ${
              activeTab === item.key
                ? "bg-white text-blue-700 font-semibold shadow-md"
                : "hover:bg-white/20"
            }`}
            onClick={() => setActiveTab(item.key)}
          >
            {item.icon} {item.label}
          </button>
        ))}

        <div className="flex-grow" />

        <button
          className="flex items-center gap-3 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 transition"
          onClick={() => setShowLogoutPopup(true)}
        >
          <FaSignOutAlt /> Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-gray-50 overflow-y-auto">
        {/* Top header */}
        <div className="flex justify-between items-center bg-white shadow px-6 py-4">
          <h2 className="text-2xl font-bold capitalize">{activeTab}</h2>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">{adminEmail}</span>
            <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
              {adminEmail ? adminEmail.charAt(0).toUpperCase() : "A"}
            </div>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden p-4">
          <button
            className="p-2 bg-blue-600 text-white rounded-lg"
            onClick={() => setIsSidebarOpen(true)}
          >
            <FaBars />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">{renderContent()}</div>
      </div>

      {/* Logout confirmation popup */}
      {showLogoutPopup && (
        <LogoutPopup
          onConfirm={handleLogout}
          onCancel={() => setShowLogoutPopup(false)}
        />
      )}
    </div>
  );
}
