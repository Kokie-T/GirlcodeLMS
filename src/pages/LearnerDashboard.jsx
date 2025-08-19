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
  HiBell,
  HiChatAlt2,
} from "react-icons/hi";

const LearnerDashboard = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [avatar, setAvatar] = useState(null);
  const [formData, setFormData] = useState({
    fullname: " ",
    email: " ",
  });

  const [notifOpen, setNotifOpen] = useState(false);
  const [msgOpen, setMsgOpen] = useState(false);
  const [notifSeen, setNotifSeen] = useState(false);

  const notifRef = useRef();
  const msgRef = useRef();

  const enrolledCourses = [
    { id: 1, title: "Introduction to Web Development", progress: 75 },
    { id: 2, title: "Data Analysis with Python", progress: 50 },
    { id: 3, title: "UI/UX Design Principles", progress: 20 },
  ];

  const menuItems = [
    { name: "Dashboard", icon: <HiOutlineHome />, path: "/learner-dashboard" },
    { name: "My Courses", icon: <HiOutlineBookOpen />, path: "/courses" },
    { name: "Profile", icon: <HiOutlineUser />, path: "/learner-profile" },
    { name: "Logout", icon: <HiOutlineLogout />, path: "/login" },
  ];

  useEffect(() => {
    const savedAvatar = localStorage.getItem("learnerAvatar");
    if (savedAvatar) {
      setAvatar(savedAvatar);
    }

    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifOpen(false);
      }
      if (msgRef.current && !msgRef.current.contains(event.target)) {
        setMsgOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setAvatar(base64String);
        localStorage.setItem("learnerAvatar", base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = (e) => {
    e.preventDefault();
    alert("Profile updated successfully!");
  };

  const notifications = [
    "New lesson added to UI/UX Design Principles",
    "Your assignment for Data Analysis is due tomorrow",
    "Course Introduction to Web Development updated",
  ];

  const messages = [
    { from: "Instructor Jane", text: "Don't forget the webinar tomorrow!" },
    { from: "Admin", text: "Your profile has been updated." },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 w-64 bg-gradient-to-b from-blue-100 to-pink-100 shadow-lg p-5 transform transition-transform duration-300 z-50
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        <h2 className="text-2xl font-semibold text-gray-800 mb-8">My LMS</h2>
        <nav className="space-y-3">
          {menuItems.map((item, idx) => (
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
          ))}
        </nav>
      </div>

      {/* Mobile Menu Toggle */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 bg-white p-2 rounded-lg shadow"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <HiX size={20} /> : <HiMenu size={20} />}
      </button>

      {/* Main Content */}
      <div className="flex-1 p-6 md:ml-64">
        {/* Header */}
        <header className="bg-gradient-to-r from-blue-100 to-pink-100 p-6 rounded-xl mb-8 shadow-sm flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">
              Welcome back, {formData.fullname} 👋
            </h1>
            <p className="text-gray-600 mt-1">
              Here’s your learning progress at a glance
            </p>
          </div>

          {/* Right side icons */}
          <div className="flex items-center space-x-5 relative">
            {/* Notifications */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => {
                  navigate("/notifications");
                  setMsgOpen(false);
                  setNotifOpen(false);
                  setNotifSeen(true); // Mark as seen
                }}
                className="relative text-gray-700 hover:text-gray-900 focus:outline-none"
                aria-label="Notifications"
              >
                <HiBell size={24} />
                {!notifSeen && notifications.length > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                    {notifications.length}
                  </span>
                )}
              </button>
            </div>

            {/* Messages */}
            <div className="relative" ref={msgRef}>
              <button
                onClick={() => {
                  setMsgOpen(!msgOpen);
                  setNotifOpen(false);
                }}
                className="relative text-gray-700 hover:text-gray-900 focus:outline-none"
                aria-label="Messages"
              >
                <HiChatAlt2 size={24} />
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                  {messages.length}
                </span>
              </button>
              {msgOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                  <div className="p-3 border-b font-semibold text-gray-700">
                    Messages
                  </div>
                  <ul className="max-h-48 overflow-y-auto">
                    {messages.map((msg, idx) => (
                      <li
                        key={idx}
                        className="px-4 py-2 border-b last:border-b-0 cursor-pointer hover:bg-gray-100"
                      >
                        <p className="font-semibold text-gray-800">{msg.from}</p>
                        <p className="text-gray-600 text-sm">{msg.text}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Avatar */}
            <div>
              {avatar ? (
                <img
                  src={avatar}
                  alt="Avatar"
                  className="w-12 h-12 rounded-full object-cover border-1 border-pink shadow"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-bold text-xl border-2 border-white shadow">
                  {formData.fullname.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Stats Section */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-5 rounded-lg shadow text-center">
            <h2 className="text-xl font-bold text-indigo-700">
              {enrolledCourses.length}
            </h2>
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
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Your Courses
          </h2>
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
                <p className="text-sm text-gray-500 mt-1">
                  {course.progress}% completed
                </p>
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
      </div>
    </div>
  );
};

export default LearnerDashboard;
