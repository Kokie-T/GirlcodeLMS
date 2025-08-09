import React, { useState, useEffect } from "react";
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

const MyCourses = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { name: "Dashboard", icon: <HiOutlineHome />, path: "/" },
    { name: "My Courses", icon: <HiOutlineBookOpen />, path: "/courses" },
    { name: "Profile", icon: <HiOutlineUser />, path: "/learner-profile" },
    { name: "Settings", icon: <HiOutlineCog />, path: "/settings" },
    { name: "Logout", icon: <HiOutlineLogout />, path: "/logout" },
  ];

  // Sample courses enrolled by learner
  const enrolledCourses = [
    { id: 1, title: "Introduction to Web Development", progress: 75 },
    { id: 2, title: "Data Analysis with Python", progress: 50 },
    { id: 3, title: "UI/UX Design Principles", progress: 20 },
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
        <header className="bg-gradient-to-r from-blue-100 to-pink-100 p-6 rounded-xl mb-8 shadow-sm">
          <h1 className="text-2xl font-semibold text-gray-800">My Courses</h1>
          <p className="text-gray-600 mt-1">Manage your enrolled courses here</p>
        </header>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
         {enrolledCourses.length === 0 ? (
           <p className="text-gray-600">You have not enrolled in any courses yet.</p>
         ) : (
           enrolledCourses.map((course) => (
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
          />
         </div>
        <p className="text-sm text-gray-500 mt-1">{course.progress}% completed</p>
      </div>
    ))
  )}
   </section>

      </div>
    </div>
  );
};

export default MyCourses;
