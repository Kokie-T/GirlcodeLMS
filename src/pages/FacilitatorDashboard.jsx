// src/pages/FacilitatorDashboard.jsx
import React, { useState, useEffect } from "react";
import {
  FaTachometerAlt,
  FaEnvelope,
  FaBook,
  FaCheckSquare,
  FaFileAlt,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaCalendarAlt,
  FaUserPlus,
} from "react-icons/fa";
import { auth } from "../firebase";
import Dashboard from "../components/Dashboard";
import EnrollStudent from "./EnrollStudent";
import Messages from "../components/MessagesPage";
import CourseManagementPage from "../components/CourseManagementPage";
import GradingPage from "../components/GradingPage";
import LearningMaterialsPage from "../components/LearningMaterialsPage";
import CalendarPage from "../components/CalendarPage";

export default function FacilitatorDashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activePage, setActivePage] = useState("Dashboard");
  const [darkMode, setDarkMode] = useState(
    () => JSON.parse(localStorage.getItem("darkMode")) || false
  );
  const [profilePopup, setProfilePopup] = useState(false);
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);
  const [profileColor, setProfileColor] = useState(
    localStorage.getItem("profileColor") || "#4F46E5"
  );
  const [user, setUser] = useState({
    firstName: "John",
    lastName: "Doe",
    email: "johndoe@example.com",
  });

  const firstInitial = user.firstName?.[0] ?? "";
  const lastInitial = user.lastName?.[0] ?? "";

  // Load Firebase user info
  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      setUser((prev) => ({
        ...prev,
        email: currentUser.email,
        firstName: currentUser.displayName?.split(" ")[0] || prev.firstName,
        lastName: currentUser.displayName?.split(" ")[1] || prev.lastName,
      }));
    }
  }, []);

  // Persist dark mode & profile color
  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
    if (darkMode) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [darkMode]);

  useEffect(() => localStorage.setItem("profileColor", profileColor), [profileColor]);

  // Logout handler
  const handleLogout = async () => {
    try {
      await auth.signOut();
      setShowLogoutPopup(false);
      window.location.href = "/login"; // redirect after logout
    } catch (error) {
      console.error("Logout failed:", error);
      alert("Failed to logout. Try again.");
    }
  };

  const sidebarItems = [
    { icon: <FaTachometerAlt />, label: "Dashboard", page: "Dashboard" },
    { icon: <FaUserPlus />, label: "Enroll Student", page: "Enroll" },
    { icon: <FaEnvelope />, label: "Messages", page: "Messages" },
    { icon: <FaBook />, label: "Course Management", page: "Courses" },
    { icon: <FaCheckSquare />, label: "Grading", page: "Grading" },
    { icon: <FaFileAlt />, label: "Learning Materials", page: "Materials" },
    { icon: <FaCalendarAlt />, label: "Calendar", page: "Calendar" },
  ];

  // Render current page
  const renderActivePage = () => {
    switch (activePage) {
      case "Dashboard":
        return <Dashboard setActivePage={setActivePage} />;
      case "Enroll":
        return <EnrollStudent />;
      case "Messages":
        return <Messages />;
      case "Courses":
        return <CourseManagementPage />;
      case "Grading":
        return <GradingPage darkMode={darkMode} />;
      case "Materials":
        return <LearningMaterialsPage />;
      case "Calendar":
        return <CalendarPage />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className={`flex h-screen ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}>
      {/* Sidebar */}
      <aside
        className={`fixed md:static top-0 left-0 h-full w-64 bg-white dark:bg-gray-800 shadow-lg flex flex-col justify-between transform transition-transform duration-300 z-50
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        <div>
          <button
            className="md:hidden p-4 self-end text-xl"
            onClick={() => setIsSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <FaTimes className={darkMode ? "text-white" : ""} />
          </button>

          <h2 className="text-xl font-bold text-center py-6 border-b dark:border-gray-700 dark:text-white">
            LMS Pro <br />
            <span className="text-sm text-gray-500 dark:text-gray-300">
              Facilitator Portal
            </span>
          </h2>

          <nav className="mt-6 space-y-2">
            {sidebarItems.map((item, idx) => (
              <SidebarItem
                key={idx}
                icon={item.icon}
                label={item.label}
                active={activePage === item.page}
                onClick={() => setActivePage(item.page)}
              />
            ))}
          </nav>
        </div>

        <div className="p-4 border-t dark:border-gray-700">
          <button
            onClick={() => setShowLogoutPopup(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm bg-red-500 text-white hover:bg-red-600 rounded-lg"
          >
            <FaSignOutAlt /> Logout
          </button>
        </div>
        {showLogoutPopup && (
          <LogoutPopup onConfirm={handleLogout} onCancel={() => setShowLogoutPopup(false)} />
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <button
            className="md:hidden p-2 bg-blue-500 text-white rounded-lg"
            onClick={() => setIsSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <FaBars />
          </button>
          <input
            type="text"
            placeholder="Search..."
            className="flex-1 mx-4 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:text-white dark:border-gray-600"
          />
          <button
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
            style={{ backgroundColor: profileColor }}
            onClick={() => setProfilePopup(true)}
          >
            {firstInitial}
            {lastInitial}
          </button>
        </div>

        {profilePopup && (
          <ProfilePopup
            user={user}
            setUser={setUser}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            profileColor={profileColor}
            setProfileColor={setProfileColor}
            close={() => setProfilePopup(false)}
          />
        )}

        {renderActivePage()}
      </main>
    </div>
  );
}

/* Sidebar Item */
const SidebarItem = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-3 w-full px-4 py-2 text-sm transition rounded-lg ${
      active
        ? "bg-blue-100 text-blue-600 font-semibold"
        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
    }`}
  >
    {icon} {label}
  </button>
);

/* Logout Popup */
const LogoutPopup = ({ onConfirm, onCancel }) => (
  <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-80 relative">
      <h2 className="text-lg font-semibold mb-4 dark:text-white">Confirm Logout</h2>
      <p className="mb-6 dark:text-gray-300">
        Are you sure you want to log out of your account?
      </p>
      <div className="flex justify-end gap-3">
        <button
          onClick={onCancel}
          className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 dark:text-white"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600"
        >
          Logout
        </button>
      </div>
    </div>
  </div>
);

/* Profile Popup */
const ProfilePopup = ({ user, setUser, darkMode, setDarkMode, profileColor, setProfileColor, close }) => {
  const languages = ["English", "Afrikaans", "Zulu", "Xhosa"];
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-96 relative transition transform scale-95">
        <button className="absolute top-2 right-2 text-gray-500 dark:text-gray-200" onClick={close}>
          <FaTimes />
        </button>
        <h2 className="text-lg font-semibold mb-4 dark:text-white">Update Profile</h2>
        <input
          type="text"
          placeholder="First Name"
          value={user.firstName}
          onChange={(e) => setUser((prev) => ({ ...prev, firstName: e.target.value }))}
          className="w-full p-2 mb-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
        />
        <input
          type="text"
          placeholder="Last Name"
          value={user.lastName}
          onChange={(e) => setUser((prev) => ({ ...prev, lastName: e.target.value }))}
          className="w-full p-2 mb-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
        />
        <input
          type="email"
          placeholder="Email"
          value={user.email}
          onChange={(e) => setUser((prev) => ({ ...prev, email: e.target.value }))}
          className="w-full p-2 mb-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
        />
        <label className="flex items-center gap-2 mb-2 dark:text-white">
          <input type="checkbox" checked={darkMode} onChange={() => setDarkMode(!darkMode)} /> Dark Mode
        </label>
        <select
          value={languages[0]}
          className="w-full p-2 mb-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
        >
          {languages.map((lang, idx) => (
            <option key={idx}>{lang}</option>
          ))}
        </select>
        <label className="flex items-center gap-2 mb-4 dark:text-white">
          Avatar Background Color:
          <input type="color" value={profileColor} onChange={(e) => setProfileColor(e.target.value)} />
        </label>
        <button onClick={close} className="bg-blue-500 text-white px-4 py-2 rounded hover:opacity-90">
          Save
        </button>
      </div>
    </div>
  );
};
