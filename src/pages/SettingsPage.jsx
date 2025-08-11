import React, { useState, useEffect } from "react";
import { updatePassword } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import toast from "react-hot-toast";

// Dummy FAQ data for chatbot
const faqs = [
  { question: "How do I reset my password?", answer: "Go to Settings > Security > Change Password." },
  { question: "How do I switch to dark mode?", answer: "Go to Settings > General > Theme Toggle." },
  { question: "How do I change my language?", answer: "Go to Settings > General > Language Selector." },
];

const SettingsPage = () => {
  const [theme, setTheme] = useState("light");
  const [language, setLanguage] = useState("English");
  const [newPassword, setNewPassword] = useState("");
  const [faqInput, setFaqInput] = useState("");
  const [chatResponse, setChatResponse] = useState("");

  // Load settings from Firestore first, fallback to localStorage if no Firestore data
  useEffect(() => {
    const loadSettings = async () => {
      const user = auth.currentUser;
      if (!user) return;
      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        if (data.theme) setTheme(data.theme);
        if (data.language) setLanguage(data.language);
      } else {
        const savedTheme = localStorage.getItem("theme");
        if (savedTheme) setTheme(savedTheme);
      }
    };
    loadSettings();
  }, []);

  // Apply theme class and save to localStorage whenever theme changes
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Theme change handler with toast notification
  const handleThemeChange = (e) => {
    setTheme(e.target.value);
    toast.success(`Switched to ${e.target.value} mode`);
  };

  // Save settings to Firestore (theme + language)
  const saveSettings = async () => {
    const user = auth.currentUser;
    if (!user) return;
    try {
      await setDoc(
        doc(db, "users", user.uid),
        { theme, language },
        { merge: true }
      );
      toast.success("Settings saved successfully!");
    } catch (error) {
      toast.error("Failed to save settings.");
    }
  };

  // Change password handler
  const handlePasswordChange = async () => {
    try {
      await updatePassword(auth.currentUser, newPassword);
      toast.success("Password updated successfully!");
      setNewPassword("");
    } catch (error) {
      toast.error("Error updating password: " + error.message);
    }
  };

  // Chatbot FAQ matcher
  const handleChatbot = () => {
    const found = faqs.find(f =>
      f.question.toLowerCase().includes(faqInput.toLowerCase())
    );
    setChatResponse(found ? found.answer : "Sorry, I couldn't find an answer to that.");
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold mb-4">Settings</h1>

      {/* General Settings */}
      <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">General Settings</h2>

        {/* Theme Toggle */}
        <div className="flex items-center justify-between mb-4">
          <span>Theme</span>
          <select
            className="border p-2 rounded"
            value={theme}
            onChange={handleThemeChange}
          >
            <option value="light">🌞 Light</option>
            <option value="dark">🌙 Dark</option>
          </select>
        </div>

        {/* Language Selector */}
        <div className="flex items-center justify-between">
          <span>Language</span>
          <select
            className="border p-2 rounded"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="English">English</option>
            <option value="Afrikaans">Afrikaans</option>
            <option value="Zulu">Zulu</option>
          </select>
        </div>

        <button
          onClick={saveSettings}
          className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          Save Changes
        </button>
      </div>

      {/* Security */}
      <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Security</h2>

        {/* Change Password */}
        <input
          type="password"
          placeholder="New Password"
          className="border p-2 rounded w-full mb-2"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <button
          onClick={handlePasswordChange}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
        >
          Change Password
        </button>
      </div>

      {/* Chatbot */}
      <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">FAQs</h2>

        <input
          type="text"
          placeholder="Ask a question..."
          className="border p-2 rounded w-full mb-2"
          value={faqInput}
          onChange={(e) => setFaqInput(e.target.value)}
        />
        <button
          onClick={handleChatbot}
          className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded mb-2"
        >
          Ask
        </button>

        {chatResponse && (
          <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded">
            {chatResponse}
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;
