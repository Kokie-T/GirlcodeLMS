// src/components/LearnerSidebar.jsx
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FaTachometerAlt,
  FaBook,
  FaEnvelope,
  FaSignOutAlt,
  FaUserCog,
  FaCalendar,
  FaStore,
  FaSearch,
} from "react-icons/fa";
import { HiMenu, HiX } from "react-icons/hi";
import { getAuth, signOut } from "firebase/auth";

export default function LearnerSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const auth = getAuth();

  const menuItems = [
    { name: "Dashboard", icon: <FaTachometerAlt />, path: "/learner-dashboard" },
    { name: "My Courses", icon: <FaBook />, path: "/courses" },
    { name: "Messages", icon: <FaEnvelope />, path: "/learner/messages" },
    { name: "Calendar", icon: <FaCalendar />, path: "/learner/calendar" },
    { name: "Settings", icon: <FaUserCog />, path: "/learner-settings" },
    { name: "Help & Support", icon: <FaSearch />, path: "/help"},
  ];

  const confirmLogout = async () => {
    try {
      await signOut(auth);
      setShowLogoutConfirm(false);
      navigate("/"); // 👈 redirect to landing page
    } catch (error) {
      console.error("Logout failed:", error.message);
    }
  };

  return (
    <>
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 w-64 bg-white dark:bg-gray-800 shadow-lg flex flex-col justify-between transform transition-transform duration-300 z-50
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        {/* Header / Logo */}
        <div className="px-6 py-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white text-center">
            LMS Pro
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-300 text-center mt-1">
            Student Portal
          </p>
        </div>

        {/* Menu */}
        <nav className="flex-1 mt-6 px-2 space-y-1">
          {menuItems.map((item, idx) => (
            <button
              key={idx}
              onClick={() => {
                navigate(item.path);
                setSidebarOpen(false);
              }}
              className={`flex items-center gap-3 w-full px-4 py-2 text-sm rounded-lg transition-colors duration-200
                ${
                  location.pathname === item.path
                    ? "bg-blue-100 text-blue-600 font-semibold"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
                }`}
            >
              <span className="text-lg">{item.icon}</span>
              {item.name}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm bg-red-500 text-white hover:bg-red-600 rounded-lg transition-colors"
          >
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </aside>

      {/* Mobile Toggle */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 bg-white dark:bg-gray-800 p-2 rounded-lg shadow"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <HiX size={24} /> : <HiMenu size={24} />}
      </button>

    {/* Logout Confirmation */}
{showLogoutConfirm && (
  <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
    <div
      className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-80"
      onClick={(e) => e.stopPropagation()}
    >
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
        Confirm Logout
      </h3>
      <p className="text-gray-600 dark:text-gray-300 mb-6">
        Are you sure you want to log out?
      </p>
      <div className="flex justify-end gap-3">
        <button
          onClick={() => setShowLogoutConfirm(false)}
          className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 transition"
        >
          Cancel
        </button>
        <button
          onClick={confirmLogout}
          className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition"
        >
          Logout
        </button>
      </div>
    </div>
  </div>
)}


    </>
  );
}
