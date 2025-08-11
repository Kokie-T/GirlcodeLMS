import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  HiOutlineHome,
  HiOutlineBookOpen,
  HiOutlineUser,
  HiOutlineCog,
  HiOutlineLogout,
  HiMenu,
  HiX,
} from "react-icons/hi";

export default function LearnerDashboard() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [avatar, setAvatar] = useState(null);
  const [isLogoutPopupOpen, setIsLogoutPopupOpen] = useState(false);
  const [formData, setFormData] = useState({
    fullname: "Kokie Ratlou",
    email: "kokiet@gmail.com",
  });

  const enrolledCourses = [
    { id: 1, title: "Introduction to Web Development", progress: 75 },
    { id: 2, title: "Data Analysis with Python", progress: 50 },
    { id: 3, title: "UI/UX Design Principles", progress: 20 },
  ];

  // Logout function
  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  // Menu items, logout uses the above function
  const menuItems = [
    { name: "Dashboard", icon: <HiOutlineHome />, path: "/learner-dashboard" },
    { name: "My Courses", icon: <HiOutlineBookOpen />, path: "/courses" },
    { name: "Assessments", icon: <HiOutlineBookOpen />, path: "/assessments" }, // new
    { name: "Profile", icon: <HiOutlineUser />, path: "/learner-profile" },
    { name: "Settings", icon: <HiOutlineCog />, path: "/settings" },
    { name: "Logout", icon: <HiOutlineLogout />, action: () => setIsLogoutPopupOpen(true) },
  ];

  useEffect(() => {
    const savedAvatar = localStorage.getItem("learnerAvatar");
    if (savedAvatar) {
      setAvatar(savedAvatar);
    }
  }, []);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result);
        localStorage.setItem("learnerAvatar", reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 w-64 bg-gradient-to-b from-blue-100 to-pink-100 shadow-lg p-5 transform transition-transform duration-300 z-50
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        <h2 className="text-2xl font-semibold text-gray-800 mb-8">My LMS</h2>
        <nav className="space-y-3">
          {menuItems.map((item, idx) =>
            item.path ? (
              <button
                key={idx}
                onClick={() => {
                  navigate(item.path);
                  setSidebarOpen(false);
                }}
                className="flex items-center gap-3 w-full p-2 rounded-lg text-gray-700 hover:bg-white hover:shadow transition"
              >
                <span className="text-lg">{item.icon}</span>
                {item.name}
              </button>
            ) : (
              <button
                key={idx}
                onClick={item.action}
                className="flex items-center gap-3 w-full p-2 rounded-lg text-gray-700 hover:bg-white hover:shadow transition"
              >
                <span className="text-lg">{item.icon}</span>
                {item.name}
              </button>
            )
          )}
        </nav>
      </aside>

      {/* Mobile Menu Toggle */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 bg-white p-2 rounded-lg shadow"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle menu"
      >
        {sidebarOpen ? <HiX size={24} /> : <HiMenu size={24} />}
      </button>

      {/* Main Content */}
      <main className="flex-1 p-6 md:ml-64">
        {/* Header */}
        <header className="bg-gradient-to-r from-blue-100 to-pink-100 p-6 rounded-xl mb-8 shadow-sm flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">
              Welcome back, {formData.fullname} 👋
            </h1>
            <p className="text-gray-600 mt-1">Here’s your learning progress at a glance</p>
          </div>

          {/* Avatar Upload */}
          <label className="relative cursor-pointer">
            {avatar ? (
              <img
                src={avatar}
                alt="Avatar"
                className="w-12 h-12 rounded-full object-cover border border-pink-400 shadow"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-bold text-xl border-2 border-white shadow">
                {formData.fullname.charAt(0).toUpperCase()}
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
              aria-label="Upload avatar"
            />
          </label>
        </header>

        {/* Stats Section */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-5 rounded-lg shadow text-center">
            <h2 className="text-xl font-bold text-indigo-700">{enrolledCourses.length}</h2>
            <p className="text-gray-500">Enrolled Courses</p>
          </div>
          <div className="bg-white p-5 rounded-lg shadow text-center">
            <h2 className="text-xl font-bold text-indigo-700">12</h2>
            <p className="text-gray-500">Completed Lessons</p>
          </div>
          <div className="bg-white p-5 rounded-lg shadow text-center">
            <h2 className="text-xl font-bold text-indigo-700">3h 45m</h2>
            <p className="text-gray-500">Study Time</p>
          </div>
        </section>

        {/* Courses Section */}
        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Your Courses</h2>
          <div className="space-y-4">
            {enrolledCourses.map((course) => (
              <div
                key={course.id}
                className="bg-white p-5 rounded-lg shadow hover:shadow-md transition cursor-pointer"
                onClick={() => navigate(`/course/${course.id}`)}
              >
                <h3 className="text-gray-800 font-medium">{course.title}</h3>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div
                    className="bg-gradient-to-r from-blue-200 to-pink-200 h-2 rounded-full transition-all"
                    style={{ width: `${course.progress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-500 mt-1">{course.progress}% completed</p>
              </div>
            ))}
          </div>
        </section>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 mt-8">
          <button
            onClick={() => navigate("/course/1")}
            className="px-5 py-2 rounded-lg bg-gradient-to-r from-blue-200 to-pink-200 font-medium text-gray-800 shadow hover:scale-105 transition"
          >
            Continue Learning
          </button>
          <button
            onClick={() => navigate("/courses")}
            className="px-5 py-2 rounded-lg border border-gray-300 bg-white font-medium text-gray-700 hover:bg-gray-50 transition"
          >
            View All Courses
          </button>
        </div>
      </main>

      {/* Logout Confirmation Popup */}
      {isLogoutPopupOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-lg p-6 w-80 shadow-lg animate-slideInRight">
            <h3 className="text-lg font-semibold mb-4">Confirm Logout</h3>
            <p className="mb-6">Are you sure you want to log out?</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsLogoutPopupOpen(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
      <style jsx>{`
        @keyframes slideInRight {
          from {
            transform: translateX(120%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slideInRight {
          animation: slideInRight 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
