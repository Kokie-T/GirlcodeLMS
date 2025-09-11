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
} from "react-icons/fa";
import { auth } from "../firebase"; // ✅ use firebase auth
import Dashboard from "../components/Dashboard";
import CourseManagementPage from "../components/CourseManagementPage";
import GradingPage from "../components/GradingPage";
import LearningMaterialsPage from "../components/LearningMaterialsPage";
import CalendarPage from "../components/CalendarPage";

export default function FacilitatorDashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activePage, setActivePage] = useState("Dashboard");

  // ✅ Profile & Settings
  const [darkMode, setDarkMode] = useState(
    () => JSON.parse(localStorage.getItem("darkMode")) || false
  );
  const [language, setLanguage] = useState(
    localStorage.getItem("language") || "English"
  );
  const [profilePopup, setProfilePopup] = useState(false);
  const [profileColor, setProfileColor] = useState(
    localStorage.getItem("profileColor") || "#4F46E5"
  );
  const [firstName, setFirstName] = useState("John");
  const [lastName, setLastName] = useState("Doe");
  const [email, setEmail] = useState("johndoe@example.com");
  const [password, setPassword] = useState("password123"); // optional mock password

  /* ------------------- Effects ------------------- */
  // Dark mode toggle
  useEffect(() => {
    if (darkMode) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
  }, [darkMode]);

  // Persist language & profileColor
  useEffect(() => {
    localStorage.setItem("language", language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem("profileColor", profileColor);
  }, [profileColor]);

  // ✅ Load Firebase user details
  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setEmail(user.email);
      if (user.displayName) {
        const [fName, lName] = user.displayName.split(" ");
        setFirstName(fName || firstName);
        setLastName(lName || lastName);
      }
    }
  }, []);

  return (
    <div className={`flex h-screen ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}>
      {/* Sidebar */}
      <div
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
            <SidebarItem
              icon={<FaTachometerAlt />}
              label="Dashboard"
              active={activePage === "Dashboard"}
              onClick={() => setActivePage("Dashboard")}
            />
            <SidebarItem
              icon={<FaEnvelope />}
              label="Messages"
              active={activePage === "Messages"}
              onClick={() => setActivePage("Messages")}
            />
            <SidebarItem
              icon={<FaBook />}
              label="Course Management"
              active={activePage === "Courses"}
              onClick={() => setActivePage("Courses")}
            />
            <SidebarItem
              icon={<FaCheckSquare />}
              label="Grading"
              active={activePage === "Grading"}
              onClick={() => setActivePage("Grading")}
            />
            <SidebarItem
              icon={<FaFileAlt />}
              label="Learning Materials"
              active={activePage === "Materials"}
              onClick={() => setActivePage("Materials")}
            />
            <SidebarItem
              icon={<FaCalendarAlt />}
              label="Calendar"
              active={activePage === "Calendar"}
              onClick={() => setActivePage("Calendar")}
            />
          </nav>
        </div>

        <div className="p-4 border-t dark:border-gray-700">
          <button
            onClick={() => {
              if (window.confirm("Are you sure you want to logout?")) {
                auth.signOut(); // ✅ log out user
              }
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm bg-red-500 text-white hover:bg-red-600 rounded-lg"
          >
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-y-auto">
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
            {firstName[0]}
            {lastName[0]}
          </button>
        </div>

        {profilePopup && (
          <ProfilePopup
            firstName={firstName}
            lastName={lastName}
            setFirstName={setFirstName}
            setLastName={setLastName}
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            language={language}
            setLanguage={setLanguage}
            profileColor={profileColor}
            setProfileColor={setProfileColor}
            close={() => setProfilePopup(false)}
          />
        )}

        {/* Render Active Page */}
        {activePage === "Dashboard" && <Dashboard setActivePage={setActivePage} />}
        {activePage === "Messages" && <div>📩 Messages Page (Coming Soon)</div>}
        {activePage === "Courses" && <CourseManagementPage />}
        {activePage === "Grading" && <GradingPage darkMode={darkMode} />}
        {activePage === "Materials" && <LearningMaterialsPage />}
        {activePage === "Calendar" && <CalendarPage />}
      </div>
    </div>
  );
}

/* ------------------- Sidebar Item ------------------- */
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

/* ------------------- Profile Popup ------------------- */
const ProfilePopup = ({
  firstName,
  lastName,
  setFirstName,
  setLastName,
  email,
  setEmail,
  password,
  setPassword,
  darkMode,
  setDarkMode,
  language,
  setLanguage,
  profileColor,
  setProfileColor,
  close,
}) => {
  const languages = ["English", "Afrikaans", "Zulu", "Xhosa"];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-96 relative transition transform scale-95">
        <button
          className="absolute top-2 right-2 text-gray-500 dark:text-gray-200"
          onClick={close}
          aria-label="Close profile popup"
        >
          <FaTimes />
        </button>
        <h2 className="text-lg font-semibold mb-4 dark:text-white">
          Update Profile
        </h2>
        <input
          type="text"
          placeholder="First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          className="w-full p-2 mb-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
        />
        <input
          type="text"
          placeholder="Last Name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          className="w-full p-2 mb-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 mb-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 mb-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
        />
        <label className="flex items-center gap-2 mb-2 dark:text-white">
          <input
            type="checkbox"
            checked={darkMode}
            onChange={() => setDarkMode(!darkMode)}
          />
          Dark Mode
        </label>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="w-full p-2 mb-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
        >
          {languages.map((lang, i) => (
            <option key={i}>{lang}</option>
          ))}
        </select>
        <label className="flex items-center gap-2 mb-4 dark:text-white">
          Avatar Background Color:
          <input
            type="color"
            value={profileColor}
            onChange={(e) => setProfileColor(e.target.value)}
          />
        </label>
        <button
          onClick={close}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:opacity-90"
        >
          Save
        </button>
      </div>
    </div>
  );
};
