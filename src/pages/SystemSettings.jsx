import React, { useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import AIAssistant from "../components/AIAssistant";
import { auth, db } from "../firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { useTheme } from "../context/ThemeContext";

export default function AdminSettings() {
  const [openSection, setOpenSection] = useState(null);
  const [showAssistant, setShowAssistant] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");

  const [emailNotif, setEmailNotif] = useState(true);
  const [inAppNotif, setInAppNotif] = useState(true);
  const [notifFrequency, setNotifFrequency] = useState("Instant");

  const { theme, toggleDarkMode, setCustomTheme } = useTheme();

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? null : section);
  };

  // Update Profile
  const handleUpdateProfile = async () => {
    if (!auth.currentUser) return alert("No user logged in!");

    try {
      const userRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(userRef, { fullName, email });
      alert("✅ Profile updated successfully!");
    } catch (err) {
      alert("❌ Error updating profile: " + err.message);
    }
  };

  // Reset Password
  const handlePasswordReset = () => {
    if (!auth.currentUser?.email) return alert("No email found!");
    sendPasswordResetEmail(auth, auth.currentUser.email)
      .then(() => alert("✅ Password reset email sent!"))
      .catch((err) => alert("❌ " + err.message));
  };

  // Save Notifications
  const handleSaveNotifications = async () => {
    if (!auth.currentUser) return;
    try {
      const userRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(userRef, {
        notifications: { email: emailNotif, inApp: inAppNotif, frequency: notifFrequency },
      });
      alert("✅ Notifications updated!");
    } catch (err) {
      alert("❌ Error: " + err.message);
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold">⚙️ Admin Settings</h3>

      {/* Profile */}
      <div className="bg-gray-50 rounded-xl shadow">
        <button
          className="w-full flex justify-between items-center p-4 font-semibold"
          onClick={() => toggleSection("profile")}
        >
          Profile & Account {openSection === "profile" ? <FaChevronUp /> : <FaChevronDown />}
        </button>
        {openSection === "profile" && (
          <div className="p-4 space-y-3 border-t">
            <input
              type="text"
              placeholder="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full p-2 border rounded-lg"
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border rounded-lg"
            />
            <button onClick={handleUpdateProfile} className="px-4 py-2 bg-blue-500 text-white rounded-lg">
              Update Profile
            </button>
          </div>
        )}
      </div>

      {/* Notifications */}
      <div className="bg-gray-50 rounded-xl shadow">
        <button
          className="w-full flex justify-between items-center p-4 font-semibold"
          onClick={() => toggleSection("notifications")}
        >
          Notifications {openSection === "notifications" ? <FaChevronUp /> : <FaChevronDown />}
        </button>
        {openSection === "notifications" && (
          <div className="p-4 space-y-3 border-t">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={emailNotif} onChange={(e) => setEmailNotif(e.target.checked)} />
              Email Notifications
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={inAppNotif} onChange={(e) => setInAppNotif(e.target.checked)} />
              In-App Notifications
            </label>
            <label className="block">
              Notification Frequency
              <select
                className="w-full p-2 border rounded-lg mt-1"
                value={notifFrequency}
                onChange={(e) => setNotifFrequency(e.target.value)}
              >
                <option>Instant</option>
                <option>Daily</option>
                <option>Weekly Digest</option>
              </select>
            </label>
            <button onClick={handleSaveNotifications} className="px-4 py-2 bg-blue-500 text-white rounded-lg">
              Save Preferences
            </button>
          </div>
        )}
      </div>

      {/* Appearance */}
      <div className="bg-gray-50 rounded-xl shadow">
        <button
          className="w-full flex justify-between items-center p-4 font-semibold"
          onClick={() => toggleSection("appearance")}
        >
          Appearance {openSection === "appearance" ? <FaChevronUp /> : <FaChevronDown />}
        </button>
        {openSection === "appearance" && (
          <div className="p-4 space-y-3 border-t">
            <label className="block">
              Theme
              <select
                className="w-full p-2 border rounded-lg mt-1"
                value={theme}
                onChange={(e) => setCustomTheme(e.target.value)}
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="blue">Blue</option>
                <option value="green">Green</option>
              </select>
            </label>
            <button onClick={toggleDarkMode} className="px-4 py-2 bg-gray-800 text-white rounded-lg">
              Toggle Dark Mode
            </button>
          </div>
        )}
      </div>

      {/* Privacy */}
      <div className="bg-gray-50 rounded-xl shadow">
        <button
          className="w-full flex justify-between items-center p-4 font-semibold"
          onClick={() => toggleSection("privacy")}
        >
          Privacy & Security {openSection === "privacy" ? <FaChevronUp /> : <FaChevronDown />}
        </button>
        {openSection === "privacy" && (
          <div className="p-4 space-y-3 border-t">
            <button
              onClick={() => {
                if (!auth.currentUser?.email) return alert("No email found!");
                sendPasswordResetEmail(auth, auth.currentUser.email)
                  .then(() => alert("✅ Password reset email sent!"))
                  .catch((err) => alert("❌ " + err.message));
              }}
              className="px-4 py-2 bg-red-500 text-white rounded-lg"
            >
              Reset Password
            </button>
          </div>
        )}
      </div>

      {/* Support */}
      <div className="bg-gray-50 rounded-xl shadow">
        <button
          className="w-full flex justify-between items-center p-4 font-semibold"
          onClick={() => toggleSection("support")}
        >
          Support & Help {openSection === "support" ? <FaChevronUp /> : <FaChevronDown />}
        </button>
        {openSection === "support" && (
          <div className="p-4 space-y-3 border-t">
            <button
              className="px-4 py-2 bg-green-500 text-white rounded-lg"
              onClick={() => setShowAssistant(!showAssistant)}
            >
              {showAssistant ? "Close AI Assistant" : "Open AI Assistant"}
            </button>
            {showAssistant && <AIAssistant />}
          </div>
        )}
      </div>
    </div>
  );
}
