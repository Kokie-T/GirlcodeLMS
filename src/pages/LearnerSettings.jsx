import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, updatePassword, updateEmail } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { HiOutlineHome, HiOutlineBookOpen, HiOutlineUser, HiOutlineLogout, HiMenu, HiX } from "react-icons/hi";
import { FaUserCircle } from "react-icons/fa";

export default function LearnerSettings() {
  const navigate = useNavigate();
  const auth = getAuth();
  const user = auth.currentUser;

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [avatar, setAvatar] = useState(null);
  const [formData, setFormData] = useState({ fullname: "", email: "", password: "" });
  const avatarInputRef = useRef(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  

  const menuItems = [
    { name: "Dashboard", icon: <HiOutlineHome />, path: "/learner-dashboard" },
    { name: "My Courses", icon: <HiOutlineBookOpen />, path: "/courses" },
    { name: "Help", icon:<HiOutlineUser/>, path:"/help" },
    { name: "Logout", icon: <HiOutlineLogout />, action: () => setShowLogoutConfirm(true) }, 
   ];

  // Fetch user profile
  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const data = userSnap.data();
        setFormData({ fullname: data.fullname || "", email: data.email || user.email, password: "" });
        setAvatar(data.avatar || null);
      }
    };

    fetchProfile();
  }, [user]);

  // Handle avatar upload
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !user) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result;
      setAvatar(base64String);

      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, { avatar: base64String });
    };
    reader.readAsDataURL(file);
  };

  // Handle input changes
  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  // Save profile updates
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!user) return;

    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, { fullname: formData.fullname });

      // Update email if changed
      if (formData.email !== user.email) await updateEmail(user, formData.email);

      // Update password if provided
      if (formData.password) await updatePassword(user, formData.password);

      alert("Profile updated successfully!");
      setFormData((prev) => ({ ...prev, password: "" })); // clear password field
    } catch (err) {
      console.error("Error updating profile:", err);
      alert(err.message || "Failed to update profile");
    }
  };
  const confirmLogout = async () => {
  try {
    await auth.signOut();
    navigate("/login");
  } catch (err) {
    console.error("Logout failed:", err);
    alert("Logout failed. Try again.");
  }
};


  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 w-64 bg-gradient-to-b from-blue-100 to-pink-100 shadow-lg p-5 transform transition-transform duration-300 z-50 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}>
        <h2 className="text-2xl font-semibold text-gray-800 mb-8">My LMS</h2>
        <nav className="space-y-3">
          {menuItems.map((item, idx) => (
            <button
              key={idx}
              onClick={() => {
                if (item.action) item.action();
                else navigate(item.path);
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
      {/* Logout Confirmation */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-80">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Confirm Logout</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to log out?</p>
            <div className="flex justify-end space-x-3">
              <button onClick={() => setShowLogoutConfirm(false)} className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition">Cancel</button>
              <button onClick={confirmLogout} className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition">Logout</button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile toggle */}
      <button className="md:hidden fixed top-4 left-4 z-50 bg-white p-2 rounded-lg shadow" onClick={() => setSidebarOpen(!sidebarOpen)}>
        {sidebarOpen ? <HiX size={20} /> : <HiMenu size={20} />}
      </button>

      {/* Main Content */}
      <div className="flex-1 p-6 md:ml-64">
        <h1 className="text-3xl font-bold mb-6 text-gray-800 text-center">Profile Management</h1>
        <form onSubmit={handleUpdateProfile} className="bg-white rounded-xl shadow-lg p-8 space-y-6 max-w-xl mx-auto">
          {/* Avatar */}
          <div className="flex flex-col items-center">
            {avatar ? <img src={avatar} alt="Avatar" className="w-28 h-28 rounded-full object-cover border-4 border-pink-200 shadow-md cursor-pointer" onClick={() => avatarInputRef.current.click()} />
              : <FaUserCircle size={96} className="text-pink-300 cursor-pointer" onClick={() => avatarInputRef.current.click()} />}
            <input ref={avatarInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
          </div>

          {/* Full Name */}
          <div>
            <label className="block mb-2 font-medium text-gray-700">Full Name</label>
            <input type="text" name="fullname" value={formData.fullname} onChange={handleInputChange} placeholder="Your full name" className="w-full p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-200" required />
          </div>

          {/* Email */}
          <div>
            <label className="block mb-2 font-medium text-gray-700">Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="you@example.com" className="w-full p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-200" required />
          </div>

          {/* Password */}
          <div>
            <label className="block mb-2 font-medium text-gray-700">New Password</label>
            <input type="password" name="password" value={formData.password} onChange={handleInputChange} placeholder="Enter new password" className="w-full p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-200" />
          </div>

          <button type="submit" className="w-full py-3 bg-gradient-to-r from-blue-200 to-pink-200 text-gray-800 font-semibold rounded-xl shadow hover:scale-105 transition">Update Profile</button>
        </form>
      </div>
    </div>
  );
}
