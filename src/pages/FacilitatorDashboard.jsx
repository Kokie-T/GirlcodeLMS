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
  FaCog,
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
import SystemSettings from "./SystemSettings";

export default function FacilitatorDashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activePage, setActivePage] = useState("Dashboard");
  const [profilePopup, setProfilePopup] = useState(false);
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);

  const [darkMode, setDarkMode] = useState(() => JSON.parse(localStorage.getItem("darkMode")) || false);
  const [profileColor, setProfileColor] = useState(localStorage.getItem("profileColor") || "#4F46E5");
  const [language, setLanguage] = useState(localStorage.getItem("language") || "en");

  const [user, setUser] = useState({ firstName: "", lastName: "", email: "", uid: "" });
  const [profileLoading, setProfileLoading] = useState(true);
  const [messageCount, setMessageCount] = useState(0);

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

  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
    if (darkMode) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem("profileColor", profileColor);
  }, [profileColor]);

  useEffect(() => {
    localStorage.setItem("language", language);
  }, [language]);

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

  const firstInitial = user.firstName ? user.firstName[0].toUpperCase() : "";
  const lastInitial = user.lastName ? user.lastName[0].toUpperCase() : "";
  const initials = firstInitial || lastInitial ? firstInitial + lastInitial : "?";

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
      case "SystemSettings":
        return <SystemSettings />;
      default:
        return <Dashboard />;
    }
  };

  const sidebarItems = [
    { icon: <FaTachometerAlt />, label: "Dashboard", page: "Dashboard" },
    { icon: <FaUserPlus />, label: "Enroll Student", page: "Enroll" },
    { icon: <FaEnvelope />, label: `Messages${messageCount > 0 ? ` (${messageCount})` : ""}`, page: "Messages" },
    { icon: <FaBook />, label: "Course Management", page: "Manage-Courses" },
    { icon: <FaCheckSquare />, label: "Grading", page: "Grading" },
    { icon: <FaCalendarAlt />, label: "Calendar", page: "Calendar" },
    { icon: <FaCog />, label: "Settings", page: "SystemSettings" },
  ];

  return (
    <div className={`flex h-screen ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}>
      {/* Sidebar */}
      <aside
        className={`fixed md:static top-0 left-0 h-full w-64 bg-gradient-to-r from-blue-400 to-pink-400 shadow-lg flex flex-col justify-between z-50 transform transition-transform duration-300 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <div>
          <button
            className="md:hidden p-4 self-end text-xl text-white"
            onClick={() => setIsSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <FaTimes />
          </button>

          <h2 className="text-2xl font-extrabold text-center py-6 text-white">
            LMS Pro<br />
            <span className="text-sm font-medium mt-1">Facilitator Portal</span>
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
        <div className="p-4 border-t border-pink-400">
          <button
            onClick={() => setShowLogoutPopup(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition"
          >
            <FaSignOutAlt /> Logout
          </button>
        </div>

        {showLogoutPopup && (
          <LogoutPopup onConfirm={handleLogout} onCancel={() => setShowLogoutPopup(false)} />
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-y-auto bg-white rounded-l-3xl shadow-lg">
        <div className="flex items-center mb-6">
          <button
            className="md:hidden p-2 bg-gradient-to-r from-blue-400 to-pink-400 text-white rounded-lg"
            onClick={() => setIsSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <FaBars />
          </button>

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
            onSave={() => setProfilePopup(false)}
            onResetPassword={async () => {
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

        <section>{renderActivePage()}</section>
      </main>
    </div>
  );
}

const SidebarItem = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-3 w-full px-4 py-2 rounded-lg text-white font-semibold transition ${
      active ?"bg-purple-600 text-white" : "bg-transparent text-white hover:bg-white hover:bg-opacity-20"
    }`}
  >
    {icon} {label}
  </button>
);

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
            {/* Add other languages as needed */}
          </select>
        </div>

        <div className="flex justify-between gap-4">
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
              className="px-4 py-2 bg-gradient-to-r from-blue-400 to-pink-400 text-white rounded hover:opacity-90"
              type="button"
            >
              Save
            </button>
          </div>
          <button
            onClick={onResetPassword}
            className="px-4 py-2 bg-yellow-500 text-white rounded hover:opacity-90"
            type="button"
          >
            Reset Password
          </button>
        </div>
      </div>
    </div>
  );
}

function LogoutPopup({ onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-[9999]">
      <div className="bg-white rounded-lg p-6 w-full max-w-sm text-center shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Confirm Logout</h2>
        <p className="mb-6 text-gray-600">Are you sure you want to logout?</p>
        <div className="flex justify-center gap-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 border rounded hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

