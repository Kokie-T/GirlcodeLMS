import React, { useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import AIAssistant from "../components/AIAssistant";

export default function Settings() {
  const [openSection, setOpenSection] = useState(null);
  const [showAssistant, setShowAssistant] = useState(false);

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? null : section);
  };

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold">⚙️ Facilitator Settings</h3>

      {/* 1. Profile & Account */}
      <div className="bg-gray-50 rounded-xl shadow">
        <button
          className="w-full flex justify-between items-center p-4 font-semibold"
          onClick={() => toggleSection("profile")}
        >
          Profile & Account
          {openSection === "profile" ? <FaChevronUp /> : <FaChevronDown />}
        </button>
        {openSection === "profile" && (
          <div className="p-4 space-y-3 border-t">
            <input
              type="text"
              placeholder="Full Name"
              className="w-full p-2 border rounded-lg"
            />
            <input
              type="email"
              placeholder="Email"
              className="w-full p-2 border rounded-lg"
            />
            <input
              type="password"
              placeholder="New Password"
              className="w-full p-2 border rounded-lg"
            />
            <button className="px-4 py-2 bg-blue-500 text-white rounded-lg">
              Update Profile
            </button>
          </div>
        )}
      </div>

      {/* 2. Teaching Preferences */}
      <div className="bg-gray-50 rounded-xl shadow">
        <button
          className="w-full flex justify-between items-center p-4 font-semibold"
          onClick={() => toggleSection("teaching")}
        >
          Teaching Preferences
          {openSection === "teaching" ? <FaChevronUp /> : <FaChevronDown />}
        </button>
        {openSection === "teaching" && (
          <div className="p-4 space-y-3 border-t">
            <label className="block">
              Default Course Visibility
              <select className="w-full p-2 border rounded-lg mt-1">
                <option>Public</option>
                <option>Private</option>
                <option>Draft</option>
              </select>
            </label>
            <label className="block">
              Grading System
              <select className="w-full p-2 border rounded-lg mt-1">
                <option>Percentage (%)</option>
                <option>Letter Grades (A-F)</option>
              </select>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" />
              Allow Late Submissions
            </label>
          </div>
        )}
      </div>

      {/* 3. Notifications */}
      <div className="bg-gray-50 rounded-xl shadow">
        <button
          className="w-full flex justify-between items-center p-4 font-semibold"
          onClick={() => toggleSection("notifications")}
        >
          Notifications
          {openSection === "notifications" ? <FaChevronUp /> : <FaChevronDown />}
        </button>
        {openSection === "notifications" && (
          <div className="p-4 space-y-3 border-t">
            <label className="flex items-center gap-2">
              <input type="checkbox" defaultChecked />
              Email Notifications
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" defaultChecked />
              In-App Notifications
            </label>
            <label className="block">
              Notification Frequency
              <select className="w-full p-2 border rounded-lg mt-1">
                <option>Instant</option>
                <option>Daily</option>
                <option>Weekly Digest</option>
              </select>
            </label>
          </div>
        )}
      </div>

      {/* 4. Language & Appearance */}
      <div className="bg-gray-50 rounded-xl shadow">
        <button
          className="w-full flex justify-between items-center p-4 font-semibold"
          onClick={() => toggleSection("appearance")}
        >
          Language & Appearance
          {openSection === "appearance" ? <FaChevronUp /> : <FaChevronDown />}
        </button>
        {openSection === "appearance" && (
          <div className="p-4 space-y-3 border-t">
            <label className="block">
              Language
              <select className="w-full p-2 border rounded-lg mt-1">
                <option value="en">English</option>
                <option value="af">Afrikaans</option>
                <option value="zu">Zulu</option>
                <option value="xh">Xhosa</option>
                <option value="st">Sotho</option>
              </select>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" />
              Enable Dark Mode
            </label>
          </div>
        )}
      </div>

      {/* 5. Privacy & Security */}
      <div className="bg-gray-50 rounded-xl shadow">
        <button
          className="w-full flex justify-between items-center p-4 font-semibold"
          onClick={() => toggleSection("privacy")}
        >
          Privacy & Security
          {openSection === "privacy" ? <FaChevronUp /> : <FaChevronDown />}
        </button>
        {openSection === "privacy" && (
          <div className="p-4 space-y-3 border-t">
            <label className="flex items-center gap-2">
              <input type="checkbox" />
              Show Profile to Learners
            </label>
            <button className="px-4 py-2 bg-red-500 text-white rounded-lg">
              Reset Password
            </button>
          </div>
        )}
      </div>

      {/* 6. Support & Help with AI Assistant */}
      <div className="bg-gray-50 rounded-xl shadow">
        <button
          className="w-full flex justify-between items-center p-4 font-semibold"
          onClick={() => toggleSection("support")}
        >
          Support & Help
          {openSection === "support" ? <FaChevronUp /> : <FaChevronDown />}
        </button>
        {openSection === "support" && (
          <div className="p-4 space-y-3 border-t">
            {/* Toggle AI Assistant */}
            <button
              className="px-4 py-2 bg-green-500 text-white rounded-lg"
              onClick={() => setShowAssistant(!showAssistant)}
            >
              {showAssistant ? "Close AI Assistant" : "Open AI Assistant"}
            </button>

            {/* AI Chatbox */}
            {showAssistant && <AIAssistant />}

            <p className="text-sm text-gray-600 mt-2">
              Need help? Visit our{" "}
              <a href="/privacy-policy" className="text-blue-500 underline">
                Privacy Policy
              </a>{" "}
              or{" "}
              <a href="/help" className="text-blue-500 underline">
                Help Center
              </a>
              .
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
