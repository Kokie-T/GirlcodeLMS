import React, { useState, useEffect } from "react";
import LearnerSidebar from "../components/LearnerSidebar";
import { getAuth, updateProfile, updatePassword } from "firebase/auth";
import { FaUserCircle, FaSun, FaMoon, FaLock, FaCamera } from "react-icons/fa";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase";

export default function LearnerSettings() {
  const auth = getAuth();
  const user = auth.currentUser;

  const [darkMode, setDarkMode] = useState(
    JSON.parse(localStorage.getItem("darkMode")) || false
  );
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [newPassword, setNewPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [avatarUrl, setAvatarUrl] = useState(user?.photoURL || "");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
    if (darkMode) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [darkMode]);

  // Update Display Name
  const handleNameChange = async () => {
    if (!displayName.trim()) return;
    try {
      await updateProfile(user, { displayName, photoURL: avatarUrl });
      setMsg("Profile updated successfully!");
    } catch (err) {
      console.error(err);
      setMsg("Failed to update profile.");
    }
  };

  // Update Password
  const handlePasswordChange = async () => {
    if (!newPassword.trim()) return;
    try {
      await updatePassword(user, newPassword);
      setMsg("Password updated successfully!");
      setNewPassword("");
    } catch (err) {
      console.error(err);
      setMsg("Failed to update password.");
    }
  };

  // Upload Avatar
  const handleAvatarUpload = async (e) => {
    if (!e.target.files[0]) return;
    const file = e.target.files[0];
    const storageRef = ref(storage, `avatars/${user.uid}-${file.name}`);
    setUploading(true);
    try {
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setAvatarUrl(url);
      await updateProfile(user, { photoURL: url });
      setMsg("Avatar updated successfully!");
    } catch (err) {
      console.error(err);
      setMsg("Failed to upload avatar.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={`flex min-h-screen ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}>
      <LearnerSidebar sidebarOpen={false} darkMode={darkMode} />

      <main className="flex-1 p-6 md:ml-64 space-y-6">
        {/* Page Header */}
        <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 p-6 rounded-xl shadow text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Settings</h1>
        </div>

        {/* Profile Card */}
        <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 p-6 rounded-xl shadow space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <FaUserCircle /> Profile
          </h2>

          <div className="flex flex-col items-center space-y-4">
            {/* Avatar */}
            <div className="relative">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Profile Avatar"
                  className="w-24 h-24 rounded-full object-cover border-2 border-gray-300"
                />
              ) : (
                <FaUserCircle className="w-24 h-24 text-gray-400" />
              )}
              <label className="absolute bottom-0 right-0 bg-blue-500 p-1 rounded-full cursor-pointer hover:bg-blue-600">
                <FaCamera className="text-white w-4 h-4" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Name Input */}
            <div className="w-full space-y-2">
              <label className="block text-gray-700 dark:text-gray-300">Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400 bg-gray-50 dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Email (readonly) */}
            <div className="w-full space-y-2">
              <label className="block text-gray-700 dark:text-gray-300">Email</label>
              <input
                type="text"
                value={user?.email || ""}
                disabled
                className="w-full rounded-lg border px-3 py-2 bg-gray-100 dark:bg-gray-700 dark:text-gray-300"
              />
            </div>

            <button
              onClick={handleNameChange}
              disabled={uploading}
              className="bg-gradient-to-r from-blue-400 to-pink-400 text-white px-4 py-2 rounded-lg shadow hover:opacity-90"
            >
              Save Profile
            </button>
          </div>
        </div>

        {/* Theme Toggle Card */}
        <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 p-6 rounded-xl shadow flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-900 dark:text-white font-semibold">
            {darkMode ? <FaMoon /> : <FaSun />} Dark Mode
          </div>
          <input
            type="checkbox"
            checked={darkMode}
            onChange={() => setDarkMode(!darkMode)}
            className="w-6 h-6 accent-pink-500"
          />
        </div>

        {/* Change Password Card */}
        <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 p-6 rounded-xl shadow space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <FaLock /> Change Password
          </h2>
          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400 bg-gray-50 dark:bg-gray-700 dark:text-white"
          />
          <button
            onClick={handlePasswordChange}
            className="bg-gradient-to-r from-blue-400 to-pink-400 text-white px-4 py-2 rounded-lg shadow hover:opacity-90"
          >
            Update Password
          </button>
          {msg && <p className="text-sm text-gray-700 dark:text-gray-300">{msg}</p>}
        </div>
      </main>
    </div>
  );
}
