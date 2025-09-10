import React, { useState } from "react";
import { FaQuestionCircle, FaMoon, FaSun, FaRobot } from "react-icons/fa";
import { db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function Help() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState("en");
  const [showPolicy, setShowPolicy] = useState(false);
  const [messages, setMessages] = useState([
    { from: "bot", text: "Hi 👋! How can I help you today?" },
  ]);
  const [input, setInput] = useState("");
  const [chatOpen, setChatOpen] = useState(false);

  const navigate = useNavigate();

  // Simple translations
  const translations = {
    en: {
      helpTitle: "Help & Support",
      intro:
        "Need assistance? Here you can find answers to common questions and get in touch with our support team.",
      name: "Your Name",
      email: "Your Email",
      message: "Message",
      send: "Send Message",
      sending: "Sending...",
      success: "Your message has been sent! We'll get back to you soon.",
    },
    zu: {
      helpTitle: "Usizo & Ukusekelwa",
      intro:
        "Udinga usizo? Lapha ungathola izimpendulo zemibuzo evame ukubuzwa futhi uxhumane nethimba lethu lokusekela.",
      name: "Igama Lakho",
      email: "I-imeyili Yakho",
      message: "Umlayezo",
      send: "Thumela Umlayezo",
      sending: "Iyathumela...",
      success: "Umlayezo wakho uthunyelwe! Sizokubuya maduze.",
    },
    af: {
      helpTitle: "Hulp & Ondersteuning",
      intro:
        "Het jy hulp nodig? Hier kan jy antwoorde op algemene vrae kry en met ons ondersteuningspan kontak maak.",
      name: "Jou Naam",
      email: "Jou E-pos",
      message: "Boodskap",
      send: "Stuur Boodskap",
      sending: "Stuur tans...",
      success: "Jou boodskap is gestuur! Ons sal gou terugkom na jou toe.",
    },
  };

  const t = translations[language];

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess("");

    try {
      await addDoc(collection(db, "supportMessages"), {
        ...form,
        createdAt: serverTimestamp(),
      });
      setForm({ name: "", email: "", message: "" });
      setSuccess(t.success);
    } catch (error) {
      console.error("Error sending message:", error);
    }

    setLoading(false);
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { from: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);

    // Dummy bot reply
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          from: "bot",
          text: "Thanks for your message! Our team will respond soon.",
        },
      ]);
    }, 1000);

    setInput("");
  };

  return (
    <div className={`${darkMode ? "dark" : ""}`}>
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="m-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
      >
        Back
      </button>

      {/* Main Content */}
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8 transition">
        <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <FaQuestionCircle size={32} className="text-pink-400 mr-3" />
              <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
                {t.helpTitle}
              </h1>
            </div>
            {/* Dark/Light Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
            >
              {darkMode ? <FaSun /> : <FaMoon />}
            </button>
          </div>

          {/* Language Selector & Privacy Policy */}
          <div className="flex justify-between mb-6">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="border p-2 rounded dark:bg-gray-700 dark:text-gray-100"
            >
              <option value="en">English</option>
              <option value="zu">isiZulu</option>
              <option value="af">Afrikaans</option>
            </select>

            <button
              onClick={() => setShowPolicy(true)}
              className="text-pink-500 underline"
            >
              Privacy Policy
            </button>
          </div>

          {/* Intro */}
          <p className="text-gray-600 dark:text-gray-300 mb-8">{t.intro}</p>

          {/* FAQ Section */}
          <div className="space-y-4 mb-10">
            <div className="bg-gradient-to-r from-blue-50 to-pink-50 dark:from-gray-700 dark:to-gray-600 p-4 rounded-lg">
              <h2 className="font-semibold text-gray-800 dark:text-gray-100">
                How do I reset my password?
              </h2>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Go to the profile page, enter your new password in the password
                field, and click "Update Profile".
              </p>
            </div>
            <div className="bg-gradient-to-r from-blue-50 to-pink-50 dark:from-gray-700 dark:to-gray-600 p-4 rounded-lg">
              <h2 className="font-semibold text-gray-800 dark:text-gray-100">
                Where can I view my courses?
              </h2>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                From the sidebar, click on "My Courses" to see all the courses
                you are enrolled in.
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block mb-2 font-medium text-gray-700 dark:text-gray-200">
                {t.name}
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                type="text"
                placeholder={t.name}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-200 dark:bg-gray-700 dark:text-gray-100"
                required
              />
            </div>
            <div>
              <label className="block mb-2 font-medium text-gray-700 dark:text-gray-200">
                {t.email}
              </label>
              <input
                name="email"
                value={form.email}
                onChange={handleChange}
                type="email"
                placeholder={t.email}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-200 dark:bg-gray-700 dark:text-gray-100"
                required
              />
            </div>
            <div>
              <label className="block mb-2 font-medium text-gray-700 dark:text-gray-200">
                {t.message}
              </label>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                placeholder={t.message}
                rows="5"
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-200 dark:bg-gray-700 dark:text-gray-100"
                required
              ></textarea>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-blue-200 to-pink-200 text-gray-800 font-semibold rounded-xl shadow hover:scale-105 transition"
            >
              {loading ? t.sending : t.send}
            </button>
          </form>

          {success && (
            <p className="mt-4 text-green-600 dark:text-green-400">{success}</p>
          )}
        </div>
      </div>

      {/* Privacy Policy Modal */}
      {showPolicy && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl max-w-lg">
            <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">
              Privacy Policy
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              Your data is safe with us. We will not share your information with
              any third parties.
            </p>
            <button
              onClick={() => setShowPolicy(false)}
              className="mt-4 px-4 py-2 bg-pink-400 text-white rounded-md"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* AI Chatbot */}
      <div className="fixed bottom-6 right-6 z-50">
        {chatOpen ? (
          <div className="w-80 bg-white dark:bg-gray-800 shadow-lg rounded-xl overflow-hidden flex flex-col">
            <div className="p-3 bg-pink-400 text-white font-bold flex justify-between items-center">
              AI Chatbot
              <button onClick={() => setChatOpen(false)}>X</button>
            </div>
            <div className="h-64 overflow-y-auto p-3 space-y-2 flex flex-col">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`p-2 rounded-lg max-w-[70%] ${
                    msg.from === "user"
                      ? "bg-pink-200 self-end"
                      : "bg-gray-200 dark:bg-gray-700 self-start"
                  }`}
                >
                  {msg.text}
                </div>
              ))}
            </div>
            <form onSubmit={sendMessage} className="flex p-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 border rounded-l-md p-2 dark:bg-gray-700 dark:text-gray-100"
              />
              <button className="bg-pink-400 text-white px-4 rounded-r-md">
                Send
              </button>
            </form>
          </div>
        ) : (
          <button
            onClick={() => setChatOpen(true)}
            className="p-4 rounded-full bg-pink-500 text-white shadow-lg"
          >
            <FaRobot size={24} />
          </button>
        )}
      </div>
    </div>
  );
}
