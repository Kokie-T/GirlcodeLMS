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
import { FaUserCircle } from "react-icons/fa";

export default function Learnerprofile() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [avatar, setAvatar] = useState(null);
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    password: "",
  });

    const [result, setResult] = React.useState("");

  const onSubmit = async (event) => {
    event.preventDefault();
    setResult("Sending....");
    const formData = new FormData(event.target);

    formData.append("access_key", "YOUR_ACCESS_KEY_HERE");

    const response = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      body: formData
    });

    const data = await response.json();

    if (data.success) {
      setResult("Form Submitted Successfully");
      event.target.reset();
    } else {
      console.log("Error", data);
      setResult(data.message);
    }
  };

  const menuItems = [
    { name: "Dashboard", icon: <HiOutlineHome />, path: "/learner-dashboard" },
    { name: "Help", icon: <HiOutlineUser />, path: "/help" },
    { name: "Logout", icon: <HiOutlineLogout />, path: "/login" },
  ];

  useEffect(() => {
    const savedAvatar = localStorage.getItem("learnerAvatar");
    if (savedAvatar) setAvatar(savedAvatar);

    const savedName = localStorage.getItem("learnerName") || "";
    const savedEmail = localStorage.getItem("learnerEmail") || "";
    setFormData((prev) => ({ ...prev, fullname: savedName, email: savedEmail }));
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
    // Save data to localStorage as example
    localStorage.setItem("learnerName", formData.fullname);
    localStorage.setItem("learnerEmail", formData.email);
    alert("Profile updated successfully!");
  };

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
        <h1 className="text-3xl font-bold mb-6 text-gray-800 text-center">Profile Management</h1>
        <form
          onSubmit={handleUpdate}
          className="bg-white rounded-xl shadow-lg p-8 space-y-6 max-w-xl mx-auto"
        >
          {/* Avatar */}
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

          {/* Full Name */}
          <div>
            <label className="block mb-2 font-medium text-gray-700">Full Name</label>
            <input
              type="text"
              name="fullname"
              value={formData.fullname}
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

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-blue-200 to-pink-200 text-gray-800 font-semibold rounded-xl shadow hover:scale-105 transition"
          >
            Update Profile
          </button>
        </form>
      </div>
    </div>
  );
}
