import React, { useState, useEffect } from "react";
import { 
  updatePassword, 
  EmailAuthProvider, 
  reauthenticateWithCredential 
} from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import toast from "react-hot-toast";

// Dummy FAQ data
const faqs = [
  { question: "How do I reset my password?", answer: "Go to Settings > Security > Change Password." },
  { question: "How do I switch to dark mode?", answer: "Go to Settings > General > Theme Toggle." },
  { question: "How do I change my language?", answer: "Go to Settings > General > Language Selector." },
];

const AccordionSection = ({ title, isOpen, onToggle, children }) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-4">
    <button
      onClick={onToggle}
      className="w-full text-left px-5 py-3 flex justify-between items-center font-semibold text-lg focus:outline-none"
      aria-expanded={isOpen}
    >
      {title}
      <span className="text-2xl select-none">{isOpen ? "−" : "+"}</span>
    </button>
    {isOpen && <div className="px-5 pb-5">{children}</div>}
  </div>
);

const SettingsPage = () => {
  const [theme, setTheme] = useState("light");
  const [language, setLanguage] = useState("English");
  const [newPassword, setNewPassword] = useState("");
  const [faqInput, setFaqInput] = useState("");
  const [chatResponse, setChatResponse] = useState("");
  const [openSection, setOpenSection] = useState("general");

  // Load settings from Firestore or fallback to localStorage
  useEffect(() => {
    const loadSettings = async () => {
      const user = auth.currentUser;
      if (!user) return;
      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        if (data.theme) setTheme(data.theme);
        else {
          const savedTheme = localStorage.getItem("theme");
          if (savedTheme) setTheme(savedTheme);
        }
        if (data.language) setLanguage(data.language);
      } else {
        const savedTheme = localStorage.getItem("theme");
        if (savedTheme) setTheme(savedTheme);
      }
    };
    loadSettings();
  }, []);

  // Apply theme class and localStorage immediately on first load & on theme change
  useEffect(() => {
    if (theme === "dark") document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Auto-save theme and language to Firestore on change
  useEffect(() => {
    const saveSettingsAuto = async () => {
      const user = auth.currentUser;
      if (!user) return;
      try {
        await setDoc(
          doc(db, "users", user.uid),
          { theme, language },
          { merge: true }
        );
      } catch {
        toast.error("Failed to auto-save settings.");
      }
    };
    saveSettingsAuto();
  }, [theme, language]);

  // Smarter FAQ search (multiple results)
  const handleChatbot = () => {
    const results = faqs.filter(
      (f) =>
        f.question.toLowerCase().includes(faqInput.toLowerCase()) ||
        f.answer.toLowerCase().includes(faqInput.toLowerCase())
    );

    if (results.length > 0) {
      setChatResponse(
        results
          .map((r, i) => (
            <div key={i} className="mb-3">
              <p className="font-semibold">Q: {r.question}</p>
              <p>A: {r.answer}</p>
            </div>
          ))
      );
    } else {
      setChatResponse("Sorry, I couldn't find an answer to that.");
    }
  };

  // Password change with reauthentication
  const handlePasswordChange = async () => {
    const user = auth.currentUser;
    if (!user) return;

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }

    try {
      // Prompt user for current password for reauth
      const currentPassword = prompt("Please enter your current password:");

      if (!currentPassword) {
        toast.error("Current password is required to update your password.");
        return;
      }

      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);

      await updatePassword(user, newPassword);
      toast.success("Password updated successfully!");
      setNewPassword("");
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>

      <AccordionSection
        title="General Settings"
        isOpen={openSection === "general"}
        onToggle={() =>
          setOpenSection(openSection === "general" ? null : "general")
        }
      >
        {/* Theme Toggle */}
        <div className="flex items-center justify-between mb-4">
          <span>Theme</span>
          <select
            className="border p-2 rounded"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
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
      </AccordionSection>

      <AccordionSection
        title="Security"
        isOpen={openSection === "security"}
        onToggle={() =>
          setOpenSection(openSection === "security" ? null : "security")
        }
      >
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
      </AccordionSection>

      <AccordionSection
        title="FAQs"
        isOpen={openSection === "faqs"}
        onToggle={() => setOpenSection(openSection === "faqs" ? null : "faqs")}
      >
        <input
          type="text"
          placeholder="Ask a question..."
          className="border p-2 rounded w-full mb-2"
          value={faqInput}
          onChange={(e) => setFaqInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleChatbot();
          }}
        />
        <button
          onClick={handleChatbot}
          className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded mb-2"
        >
          Ask
        </button>

        <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded whitespace-pre-line">
          {chatResponse}
        </div>
      </AccordionSection>
    </div>
  );
};

export default SettingsPage;
