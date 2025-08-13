import React, { useState, useEffect } from "react";
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import toast from "react-hot-toast";

export default function SettingsPage({ onBack }) {
  const [faqSearch, setFaqSearch] = useState("");
  const [filteredFaqs, setFilteredFaqs] = useState([]);
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [settings, setSettings] = useState({ theme: "light", language: "en" });

  const faqs = [
    { question: "How do I change my password?", answer: "Go to settings and update your password." },
    { question: "Can I change my theme?", answer: "Yes, switch between light and dark mode anytime." },
  ];

  useEffect(() => {
    const fetchSettings = async () => {
      const docRef = doc(db, "settings", auth.currentUser.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) setSettings(docSnap.data());
    };
    fetchSettings();
  }, []);

  const saveSettings = async (newSettings) => {
    setSettings(newSettings);
    await setDoc(doc(db, "settings", auth.currentUser.uid), newSettings);
    toast.success("Settings saved");
  };

  const changePassword = async () => {
    try {
      const credential = EmailAuthProvider.credential(auth.currentUser.email, password);
      await reauthenticateWithCredential(auth.currentUser, credential);
      await updatePassword(auth.currentUser, password);
      toast.success("Password updated");
    } catch (error) {
      toast.error(error.message);
    }
  };

  const searchFaqs = (query) => {
    setFaqSearch(query);
    setFilteredFaqs(faqs.filter(faq => faq.question.toLowerCase().includes(query.toLowerCase())));
  };

  return (
    <div className="p-6 bg-slate-50 dark:bg-gray-900 min-h-screen text-gray-800 dark:text-gray-100">
      
      {/* Back Button */}
      <button
        onClick={() => navigate("/FacilitatorDashboard")}
        className="mb-4 px-4 py-2 rounded bg-indigo-400 hover:bg-indigo-500 text-white shadow-sm transition"
      >
        ← Back
      </button>

      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      {/* Theme & Language */}
      <div className="mb-6 bg-slate-50 dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <label className="block mb-2">Theme</label>
        <select
          value={settings.theme}
          onChange={(e) => saveSettings({ ...settings, theme: e.target.value })}
          className="border border-gray-300 dark:border-gray-600 bg-slate-50 dark:bg-gray-700 p-2 rounded shadow-sm"
        >
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>

        <label className="block mt-4 mb-2">Language</label>
        <select
          value={settings.language}
          onChange={(e) => saveSettings({ ...settings, language: e.target.value })}
          className="border border-gray-300 dark:border-gray-600 bg-slate-50 dark:bg-gray-700 p-2 rounded shadow-sm"
        >
          <option value="en">English</option>
          <option value="es">Spanish</option>
        </select>
      </div>

      {/* Change Password */}
      <div className="mb-6 bg-slate-50 dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <label className="block mb-2">New Password</label>
        <input
          type="password"
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-gray-300 dark:border-gray-600 bg-slate-50 dark:bg-gray-700 p-2 rounded shadow-sm"
        />
        <button
          onClick={changePassword}
          className="mt-3 bg-green-400 hover:bg-green-500 text-white px-4 py-2 rounded shadow-sm transition"
        >
          Update Password
        </button>
      </div>

      {/* FAQ Section */}
      <div className="bg-slate-50 dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <input
          type="text"
          value={faqSearch}
          onChange={(e) => searchFaqs(e.target.value)}
          placeholder="Search FAQs..."
          className="w-full border border-gray-300 dark:border-gray-600 bg-slate-50 dark:bg-gray-700 p-2 rounded shadow-sm mb-4"
        />
        {(faqSearch ? filteredFaqs : faqs).map((faq, i) => (
          <div key={i} className="mb-4">
            <p className="font-medium">{faq.question}</p>
            <p className="p-3 bg-slate-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded shadow-sm">
              {faq.answer}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
