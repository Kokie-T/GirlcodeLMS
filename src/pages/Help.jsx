import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaQuestionCircle, FaRobot } from "react-icons/fa";
import {
  HiOutlineBriefcase,
  HiOutlineHome,
  HiOutlineBookOpen,
  HiOutlineLogout,
  HiMenu,
  HiX,
} from "react-icons/hi";
import { getAuth, signOut } from "firebase/auth";

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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const menuItems = [
    { name: "Dashboard", icon: <HiOutlineHome />, path: "/learner-dashboard" },
    { name: "My Courses", icon: <HiOutlineBookOpen />, path: "/courses" },
    { name: "Settings", icon: <HiOutlineBriefcase />, path: "/learner-settings" },
  ];

  const confirmLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

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

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 w-64 bg-white shadow-lg flex flex-col justify-between transform transition-transform duration-300 z-50
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        <div>
          <h2 className="text-2xl font-bold text-center py-6 border-b text-gray-800">
            LMS Pro <br />
            <span className="text-sm text-gray-500">Learner Portal</span>
          </h2>
          <nav className="mt-6 flex flex-col gap-3 px-3">
            {menuItems.map((item, idx) => (
              <button
                key={idx}
                onClick={() => {
                  navigate(item.path);
                  setSidebarOpen(false);
                }}
                className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 hover:scale-105 transition transform duration-200"
              >
                <span className="text-lg">{item.icon}</span>
                {item.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-4 border-t">
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm bg-red-500 text-white hover:bg-red-600 rounded-lg"
          >
            <HiOutlineLogout /> Logout
          </button>
        </div>
      </div>

      {/* Mobile Sidebar Toggle */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <HiX size={20} /> : <HiMenu size={20} />}
      </button>

      {/* Logout Confirmation */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-80">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Confirm Logout</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to log out?</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 p-4 md:ml-64 md:p-8 transition-all">
        <header className="mb-6 md:mb-8">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <FaQuestionCircle className="text-pink-400" /> Help & Support
          </h1>
          <p className="text-gray-600 mt-2">Find answers to common questions or contact support.</p>
        </header>

        {/* FAQ Section */}
        <div className="mb-6 md:mb-8 space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h2 className="font-semibold text-gray-800">How do I reset my password?</h2>
            <p className="text-gray-600 text-sm">Go to your profile, enter a new password, and click "Update Profile".</p>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg">
            <h2 className="font-semibold text-gray-800">Where can I view my courses?</h2>
            <p className="text-gray-600 text-sm">Click "My Courses" in the sidebar to see all enrolled courses.</p>
          </div>
        </div>

        {/* Contact Form */}
        <form className="bg-white rounded-xl shadow-lg p-4 md:p-6 space-y-4 max-w-lg mx-auto" onSubmit={handleSubmit}>
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
      </div>

      {/* Chatbot Button */}
      <div className="fixed bottom-6 right-6">
        {chatOpen ? (
          <div className="w-80 bg-white shadow-lg rounded-xl flex flex-col">
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
    </div>
  );
}
