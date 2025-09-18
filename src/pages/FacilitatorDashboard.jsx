import React, { useState, useEffect } from "react";
import {
  FaTachometerAlt,
  FaEnvelope,
  FaBook,
  FaCheckSquare,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaCalendarAlt,
  FaQuestionCircle,
  FaUserPlus,
} from "react-icons/fa";
import { auth, db } from "../firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import { doc, getDoc, collection, getDocs, query, where } from "firebase/firestore";
import Dashboard from "../components/Dashboard";
import EnrollStudent from "./EnrollStudent";
import Messages from "../components/MessagesPage";
import CourseManagementPage from "../components/CourseManagementPage";
import GradingPage from "../components/GradingPage";
import CalendarPage from "../components/CalendarPage";
import FacilitatorHelp from "../components/FacilitatorHelp";

export default function FacilitatorDashboard() {
  // Sidebar & UI state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activePage, setActivePage] = useState("Dashboard");
  const [profilePopup, setProfilePopup] = useState(false);
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);

  // Dark mode & customization state (persisted)
  const [darkMode, setDarkMode] = useState(() => JSON.parse(localStorage.getItem("darkMode")) || false);
  const [profileColor, setProfileColor] = useState(localStorage.getItem("profileColor") || "#4F46E5");

  // Language state (persisted)
  const [language, setLanguage] = useState(localStorage.getItem("language") || "en");

  // User profile object & loading state
  const [user, setUser] = useState({ firstName: "", lastName: "", email: "", uid: "" });
  const [profileLoading, setProfileLoading] = useState(true);

  // Messages count state
  const [messageCount, setMessageCount] = useState(0);

  // Fetch user profile on mount or auth change
  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      setUser((prev) => ({ ...prev, uid: currentUser.uid, email: currentUser.email }));
      const fetchUserProfile = async () => {
        try {
          const userDocRef = doc(db, "users", currentUser.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUser((prev) => ({
              ...prev,
              firstName: data.firstName || "",
              lastName: data.lastName || "",
            }));
          }
        } catch (err) {
          console.error("Failed to fetch user profile:", err);
        } finally {
          setProfileLoading(false);
        }
      };
      fetchUserProfile();
    } else {
      setProfileLoading(false);
    }
  }, []);

  // Persist dark mode and update class
  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
    if (darkMode) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [darkMode]);

  // Persist profile color
  useEffect(() => {
    localStorage.setItem("profileColor", profileColor);
  }, [profileColor]);

  // Persist language
  useEffect(() => {
    localStorage.setItem("language", language);
    // i18n integration could go here
  }, [language]);

  // Fetch unread messages count dynamically from Firestore
  useEffect(() => {
    const fetchUnreadMessages = async () => {
      try {
        const q = query(collection(db, "messages"), where("read", "==", false));
        const querySnap = await getDocs(q);
        setMessageCount(querySnap.size);
      } catch (error) {
        console.error("Error fetching messages count:", error);
        setMessageCount(0);
      }
    };
    fetchUnreadMessages();
  }, []);

  // Logout handler
  const handleLogout = async () => {
    try {
      await auth.signOut();
      setShowLogoutPopup(false);
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout failed:", error);
      alert("Failed to logout. Try again.");
    }
  };

  // Compute initials for display with fallback
  const firstInitial = user.firstName ? user.firstName[0].toUpperCase() : "";
  const lastInitial = user.lastName ? user.lastName[0].toUpperCase() : "";
  const initials = firstInitial || lastInitial ? firstInitial + lastInitial : "?"; // "?" fallback

  // Render active page component
  const renderActivePage = () => {
    switch (activePage) {
      case "Dashboard":
        return <Dashboard setActivePage={setActivePage} />;
      case "Enroll":
        return <EnrollStudent />;
      case "Messages":
        return <Messages />;
      case "Manage-Courses":
        return <CourseManagementPage />;
      case "Grading":
        return <GradingPage darkMode={darkMode} />;
      case "Calendar":
        return <CalendarPage />;
      case "FacilitatorHelp":
        return <FacilitatorHelp />;
      default:
        return <Dashboard />;
    }
  };

  // Sidebar items with gradient backgrounds and message counts
  const sidebarItems = [
    { icon: <FaTachometerAlt />, label: "Dashboard", page: "Dashboard" },
    { icon: <FaUserPlus />, label: "Enroll Student", page: "Enroll" },
    { icon: <FaEnvelope />, label: `Messages${messageCount > 0 ? ` (${messageCount})` : ""}`, page: "Messages" },
    { icon: <FaBook />, label: "Course Management", page: "Manage-Courses" },
    { icon: <FaCheckSquare />, label: "Grading", page: "Grading" },
    { icon: <FaCalendarAlt />, label: "Calendar", page: "Calendar" },
    { icon: <FaQuestionCircle />, label: "Help", page: "FacilitatorHelp" },
  ];

  return (
    <div className={`flex h-screen ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}>
      {/* Sidebar */}
      <aside
        className={`fixed md:static top-0 left-0 h-full w-64 bg-white dark:bg-gray-800 shadow-lg flex flex-col justify-between transform transition-transform duration-300 z-50 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
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
            <span className="text-sm text-gray-500 dark:text-gray-300">Facilitator Portal</span>
          </h2>

          <nav className="mt-6 space-y-2 px-2">
            {sidebarItems.map((item, idx) => (
              <SidebarItem
                key={idx}
                icon={item.icon}
                label={item.label}
                active={activePage === item.page}
                onClick={() => {
                  setActivePage(item.page);
                  setIsSidebarOpen(false);
                }}
              />
            ))}
          </nav>
        </div>

        <div className="p-4 border-t dark:border-gray-700">
          <button
            onClick={() => setShowLogoutPopup(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-400 to-pink-400 text-white font-semibold rounded-lg hover:opacity-90 transition"
          >
            <FaSignOutAlt /> Logout
          </button>
        </div>

        {showLogoutPopup && (
          <LogoutPopup onConfirm={handleLogout} onCancel={() => setShowLogoutPopup(false)} />
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-y-auto relative">
        <div className="flex items-center mb-6">
          <button
            className="md:hidden p-2 bg-blue-500 text-white rounded-lg"
            onClick={() => setIsSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <FaBars />
          </button>

          {/* Profile Button */}
          <div className="ml-auto">
            {!profileLoading ? (
              <button
                className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-xl select-none"
                style={{ backgroundColor: profileColor, lineHeight: 1, userSelect: "none" }}
                onClick={() => setProfilePopup(true)}
                title={`${user.firstName} ${user.lastName}`}
                aria-label="Open profile settings"
              >
                {initials}
              </button>
            ) : (
              <div
                className="w-14 h-14 rounded-full bg-gray-300 dark:bg-gray-700 animate-pulse"
                aria-label="Loading profile"
              />
            )}
          </div>
        </div>

        {profilePopup && (
          <ProfilePopup
            user={user}
            setUser={setUser}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            profileColor={profileColor}
            setProfileColor={setProfileColor}
            language={language}
            setLanguage={setLanguage}
            close={() => setProfilePopup(false)}
            onSave={() => setProfilePopup(false)} // sample handler
            onResetPassword={async () => { // sample handler
              try {
                if (user.email) {
                  await sendPasswordResetEmail(auth, user.email);
                  alert("Password reset email sent!");
                }
              } catch (error) {
                alert("Failed to send password reset email.");
                console.error(error);
              }
            }}
          />
        )}

        {renderActivePage()}
      </main>
    </div>
  );
}

const SidebarItem = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-3 w-full px-4 py-2 rounded-lg bg-gradient-to-r from-blue-400 to-pink-400 text-white font-semibold transition ${
      active ? "opacity-100" : "opacity-80 hover:opacity-100"
    }`}
  >
    {icon} {label}
  </button>
);

// Minimal ProfilePopup component to avoid blank page
function ProfilePopup({
  user,
  setUser,
  darkMode,
  setDarkMode,
  profileColor,
  setProfileColor,
  language,
  setLanguage,
  close,
  onSave,
  onResetPassword,
}) {
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      aria-modal="true"
      role="dialog"
      aria-labelledby="profile-popup-title"
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-auto">
        <h2 id="profile-popup-title" className="text-xl font-semibold mb-4 dark:text-white">
          Profile Settings
        </h2>

        <div className="mb-4">
          <label className="block mb-1 dark:text-gray-300">First Name</label>
          <input
            type="text"
            className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            value={user.firstName}
            onChange={(e) => setUser((prev) => ({ ...prev, firstName: e.target.value }))}
          />
        </div>

        <div className="mb-4">
          <label className="block mb-1 dark:text-gray-300">Last Name</label>
          <input
            type="text"
            className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            value={user.lastName}
            onChange={(e) => setUser((prev) => ({ ...prev, lastName: e.target.value }))}
          />
        </div>

        <div className="mb-4">
          <label className="block mb-1 dark:text-gray-300">Profile Color</label>
          <input
            type="color"
            className="w-14 h-10 p-0 border-0 rounded cursor-pointer"
            value={profileColor}
            onChange={(e) => setProfileColor(e.target.value)}
          />
        </div>

        <div className="mb-6">
          <label className="block mb-1 dark:text-gray-300">Language</label>
          <select
            className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="en">English</option>
            <option value="es">Spanish</option>
            {/* Add other languages as needed */}
          </select>
        </div>

        <div className="flex justify-between gap-4">
          <button
            onClick={onResetPassword}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            type="button"
          >
            Reset Password
          </button>
          <div className="flex gap-2">
            <button
              onClick={close}
              className="px-4 py-2 border rounded hover:bg-gray-100 dark:hover:bg-gray-700"
              type="button"
            >
              Cancel
            </button>
            <button
              onClick={onSave}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              type="button"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Placeholder LogoutPopup component
function LogoutPopup({ onConfirm, onCancel }) {
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="logout-popup-title"
      aria-describedby="logout-popup-desc"
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-sm text-center">
        <h2 id="logout-popup-title" className="text-xl font-semibold mb-4 dark:text-white">
          Confirm Logout
        </h2>
        <p id="logout-popup-desc" className="mb-6 dark:text-gray-300">
          Are you sure you want to logout?
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 border rounded hover:bg-gray-100 dark:hover:bg-gray-700"
            type="button"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            type="button"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
