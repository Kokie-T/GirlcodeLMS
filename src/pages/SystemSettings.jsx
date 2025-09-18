import React, { useState, useEffect } from "react";
import { auth, db, storage } from "../firebase";
import { updateProfile, updatePassword } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function SystemSettings() {
  const user = auth.currentUser;

  const [name, setName] = useState("");
  const [avatarURL, setAvatarURL] = useState("");
  const [theme, setTheme] = useState("light");
  const [notifications, setNotifications] = useState(true);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const themeOptions = [
    { label: "Light", value: "light" },
    { label: "Dark", value: "dark" },
    { label: "Blue", value: "blue" },
    { label: "Green", value: "green" },
    { label: "Purple", value: "purple" },
    { label: "Red", value: "red" },
  ];

  // Load user data
  useEffect(() => {
    if (!user) return;

    const fetchUser = async () => {
      try {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setName(data.name || "");
          setAvatarURL(data.avatarURL || "");
          setTheme(data.theme || "light");
          setNotifications(data.notifications ?? true);
          applyTheme(data.theme || "light");
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchUser();
  }, [user]);

  // Apply theme dynamically
  const applyTheme = (themeName) => {
    document.documentElement.className = ""; // reset
    document.documentElement.classList.add(`theme-${themeName}`);
  };

  // Save profile changes
  const handleProfileSave = async () => {
    if (!user) return;
    setLoading(true);
    setMessage("");

    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, { name, theme, notifications });

      await updateProfile(user, { displayName: name });

      applyTheme(theme);

      setMessage("Profile updated successfully!");
    } catch (err) {
      console.error(err);
      setMessage("Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  // Upload avatar
  const handleAvatarUpload = async (e) => {
    if (!user) return;
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    setMessage("");

    try {
      const storageRef = ref(storage, `avatars/${user.uid}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setAvatarURL(url);

      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, { avatarURL: url });

      await updateProfile(user, { photoURL: url });

      setMessage("Avatar uploaded successfully!");
    } catch (err) {
      console.error(err);
      setMessage("Failed to upload avatar.");
    } finally {
      setLoading(false);
    }
  };

  // Change password
  const handlePasswordChange = async () => {
    setMessage("");
    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match!");
      return;
    }
    if (!newPassword) return;

    setLoading(true);
    try {
      await updatePassword(user, newPassword);
      setNewPassword("");
      setConfirmPassword("");
      setMessage("Password updated successfully!");
    } catch (err) {
      console.error(err);
      setMessage("Failed to update password. You may need to re-login.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-bold mb-6">System Settings</h2>

      {message && (
        <div className="mb-4 px-4 py-2 rounded-xl bg-blue-100 text-blue-700">{message}</div>
      )}

      {/* Profile Section */}
      <div className="bg-white shadow rounded-xl p-6 mb-6">
        <h3 className="text-xl font-semibold mb-4">Profile</h3>
        <div className="flex items-center gap-4 mb-4">
          <img
            src={avatarURL || "/default-avatar.png"}
            alt="Avatar"
            className="w-16 h-16 rounded-full object-cover border"
          />
          <input type="file" onChange={handleAvatarUpload} />
        </div>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          className="w-full mb-4 px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="flex justify-end">
          <button
            onClick={handleProfileSave}
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded-xl hover:bg-blue-600 transition"
          >
            Save Profile
          </button>
        </div>
      </div>

      {/* Password Section */}
      <div className="bg-white shadow rounded-xl p-6 mb-6">
        <h3 className="text-xl font-semibold mb-4">Change Password</h3>
        <input
          type="password"
          placeholder="New password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full mb-2 px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="password"
          placeholder="Confirm password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full mb-4 px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="flex justify-end">
          <button
            onClick={handlePasswordChange}
            disabled={loading}
            className="bg-green-500 text-white px-4 py-2 rounded-xl hover:bg-green-600 transition"
          >
            Update Password
          </button>
        </div>
      </div>

      {/* Preferences */}
      <div className="bg-white shadow rounded-xl p-6 mb-6 flex flex-col gap-4">
        <h3 className="text-xl font-semibold mb-2">Preferences</h3>
        <div className="flex items-center justify-between">
          <span>Enable Notifications</span>
          <input
            type="checkbox"
            checked={notifications}
            onChange={() => setNotifications(!notifications)}
            className="w-5 h-5"
          />
        </div>
        <div className="flex items-center justify-between">
          <span>Theme</span>
          <select
            value={theme}
            onChange={(e) => {
              setTheme(e.target.value);
              applyTheme(e.target.value);
            }}
            className="px-3 py-2 border rounded-xl"
          >
            {themeOptions.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Help Section */}
      <div className="bg-white shadow rounded-xl p-6 mb-6">
        <h3 className="text-xl font-semibold mb-4">Help</h3>
        <p className="text-gray-600 mb-2">
          For assistance, visit our <a href="/contact" className="text-blue-500 underline">FAQ</a> or contact support@lmspro.com.
        </p>
      </div>
    </div>
  );
}
