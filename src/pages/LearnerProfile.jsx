import React, { useState, useEffect } from "react";
import { FaBars, FaTimes, FaUserCircle } from "react-icons/fa";

export default function Learnerprofile() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [avatar, setAvatar] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

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
        const base64String = reader.result;
        setAvatar(base64String);
        localStorage.setItem("learnerAvatar", base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    alert("Profile updated successfully!");
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 bg-gradient-to-b from-blue-100 to-pink-100 text-gray-800 w-64 p-6 transform
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} transition-transform duration-300 lg:translate-x-0 z-50 shadow-lg`}
      >
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold">Learner Menu</h2>
          <button className="lg:hidden" onClick={() => setSidebarOpen(false)}>
            <FaTimes size={24} />
          </button>
        </div>
        <nav className="space-y-5">
          <a
            href="/learner-dashboard"
            className="block px-3 py-2 rounded-md hover:bg-white hover:shadow-md transition"
          >
            Dashboard
          </a>
          <a
            href="#"
            className="block px-3 py-2 rounded-md hover:bg-white hover:shadow-md transition"
          >
            My Courses
          </a>
          <a
            href="#"
            className="block px-3 py-2 rounded-md hover:bg-white hover:shadow-md transition"
          >
            Settings
          </a>

          <a
            href="#"
            className="block px-3 py-2 rounded-md hover:bg-white hover:shadow-md transition"
          >
            Logout
          </a>

            <a
              href="/help"
              className="block px-3 py-2 rounded-md hover:bg-white hover:shadow-md transition"
            >
               Help
            </a>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Mobile top bar */}
        <div className="bg-white shadow-md p-4 flex justify-between items-center lg:hidden">
          <button onClick={() => setSidebarOpen(true)}>
            <FaBars size={24} />
          </button>
          <h1 className="text-lg font-semibold text-gray-800">Learner Profile</h1>
        </div>

        {/* Page content */}
        <main className="p-8 mt-6 lg:mt-0 max-w-xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 text-gray-800">Profile Management</h1>
          <form
            onSubmit={handleUpdate}
            className="bg-white rounded-xl shadow-lg p-8 space-y-6"
          >
            {/* Avatar upload */}
            <div className="flex flex-col items-center">
              {avatar ? (
                <img
                  src={avatar}
                  alt="Avatar"
                  className="w-28 h-28 rounded-full object-cover border-4 border-pink-200 shadow-md"
                />
              ) : (
                <FaUserCircle size={96} className="text-pink-300" />
              )}
              <label
                htmlFor="avatar-upload"
                className="mt-4 cursor-pointer inline-block px-5 py-2 bg-gradient-to-r from-blue-200 to-pink-200 text-gray-800 rounded-full font-semibold hover:brightness-105 transition"
              >
                Upload Avatar
              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>

            {/* Name */}
            <div>
              <label className="block mb-2 font-medium text-gray-700">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Your full name"
                className="w-full p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-200"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block mb-2 font-medium text-gray-700">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="you@example.com"
                className="w-full p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-200"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block mb-2 font-medium text-gray-700">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter new password"
                className="w-full p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-200"
              />
            </div>

            {/* Submit button */}
            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-blue-200 to-pink-200 text-gray-800 font-semibold rounded-xl shadow hover:scale-105 transition"
            >
              Update Profile
            </button>
          </form>
        </main>
      </div>
    </div>
  );
}
