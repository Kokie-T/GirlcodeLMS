import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaQuestionCircle, FaRobot } from "react-icons/fa";
import { getAuth, signOut } from "firebase/auth";
import LearnerSidebar from "../components/LearnerSidebar";

export default function Help() {
  const navigate = useNavigate();
  const auth = getAuth();
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: "bot", text: "Hi 👋! How can I help you today?" },
  ]);
  const [input, setInput] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setSuccess("Message sent successfully!");
      setForm({ name: "", email: "", message: "" });
      setLoading(false);
    }, 1000);
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setMessages([...messages, { from: "user", text: input }]);
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { from: "bot", text: "Thanks! Our team will respond soon." },
      ]);
    }, 1000);
    setInput("");
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Shared Sidebar */}
      <LearnerSidebar onLogout={handleLogout} />

      {/* Main Content */}
      <main className="flex-1 p-4 md:ml-64 md:p-8 transition-all">
        <header className="mb-6 md:mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
            <FaQuestionCircle className="text-pink-400" /> Help & Support
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Find answers to common questions or contact support.
          </p>
        </header>

        {/* FAQ Section */}
        <div className="mb-6 md:mb-8 space-y-4">
          <div className="p-4 bg-blue-50 dark:bg-gray-800 rounded-lg">
            <h2 className="font-semibold text-gray-800 dark:text-white">How do I reset my password?</h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Go to your profile, enter a new password, and click "Update Profile".
            </p>
          </div>
          <div className="p-4 bg-blue-50 dark:bg-gray-800 rounded-lg">
            <h2 className="font-semibold text-gray-800 dark:text-white">Where can I view my courses?</h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Click "My Courses" in the sidebar to see all enrolled courses.
            </p>
          </div>
        </div>

        {/* Contact Form */}
        <form
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 md:p-6 space-y-4 max-w-lg mx-auto"
          onSubmit={handleSubmit}
        >
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Your Name"
            className="w-full p-3 border rounded-md focus:ring-2 focus:ring-pink-200"
            required
          />
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Your Email"
            className="w-full p-3 border rounded-md focus:ring-2 focus:ring-pink-200"
            required
          />
          <textarea
            name="message"
            value={form.message}
            onChange={handleChange}
            placeholder="Message"
            rows={5}
            className="w-full p-3 border rounded-md focus:ring-2 focus:ring-pink-200"
            required
          ></textarea>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-blue-200 to-pink-200 text-gray-800 font-semibold rounded-xl shadow hover:scale-105 transition"
          >
            {loading ? "Sending..." : "Send Message"}
          </button>
          {success && <p className="text-green-600">{success}</p>}
        </form>

        {/* Chatbot Button */}
        <div className="fixed bottom-6 right-6">
          {chatOpen ? (
            <div className="w-80 bg-white dark:bg-gray-800 shadow-lg rounded-xl flex flex-col">
              <div className="p-3 bg-pink-400 text-white font-bold flex justify-between items-center">
                AI Chatbot
                <button onClick={() => setChatOpen(false)}>X</button>
              </div>
              <div className="p-3 h-64 overflow-y-auto flex flex-col gap-2">
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`p-2 rounded-lg max-w-[70%] ${
                      msg.from === "user" ? "bg-pink-200 self-end" : "bg-gray-200 self-start"
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
                  className="flex-1 border rounded-l-md p-2"
                />
                <button className="bg-pink-400 text-white px-4 rounded-r-md">Send</button>
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
      </main>
    </div>
  );
}
