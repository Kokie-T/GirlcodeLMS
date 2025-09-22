import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaQuestionCircle, FaRobot } from "react-icons/fa";
import { getAuth, signOut } from "firebase/auth";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp
} from "firebase/firestore";
import LearnerSidebar from "../components/LearnerSidebar";

export default function Help() {
  const navigate = useNavigate();
  const auth = getAuth();
  const user = auth.currentUser;

  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  // Load chat history for this user
  useEffect(() => {
    if (!user) return;

    const messagesRef = collection(db, "chatbotMessages");
    const q = query(
      messagesRef,
      where("userId", "==", user.uid),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => doc.data());
      setMessages(msgs.length > 0 ? msgs : [{ from: "bot", text: "Hi 👋! How can I help you today?" }]);
    });

    return () => unsubscribe();
  }, [user]);

  // Auto scroll chat to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    try {
      await addDoc(collection(db, "helpMessages"), {
        name: form.name,
        email: form.email,
        message: form.message,
        userId: user.uid,
        createdAt: serverTimestamp(),
      });
      setSuccess("Message sent successfully!");
      setForm({ name: "", email: "", message: "" });
    } catch (err) {
      console.error(err);
      setSuccess("Failed to send message. Try again.");
    } finally {
      setLoading(false);
      setTimeout(() => setSuccess(""), 4000);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || !user) return;

    try {
      await addDoc(collection(db, "chatbotMessages"), {
        text: input,
        from: "user",
        userId: user.uid,
        createdAt: serverTimestamp(),
      });

      setInput("");

      // Simulate bot reply
      setTimeout(async () => {
        await addDoc(collection(db, "chatbotMessages"), {
          text: "Thanks! Our team will respond soon.",
          from: "bot",
          userId: user.uid,
          createdAt: serverTimestamp(),
        });
      }, 1000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <LearnerSidebar onLogout={handleLogout} />

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
            <h2 className="font-semibold text-gray-800 dark:text-white">
              How do I reset my password?
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Go to your profile, enter a new password, and click "Update Profile".
            </p>
          </div>
          <div className="p-4 bg-blue-50 dark:bg-gray-800 rounded-lg">
            <h2 className="font-semibold text-gray-800 dark:text-white">
              Where can I view my courses?
            </h2>
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

        {/* Chatbot */}
        <div className="fixed bottom-6 right-6 z-50">
          {chatOpen ? (
            <div className="w-72 sm:w-80 bg-white dark:bg-gray-800 shadow-lg rounded-xl flex flex-col">
              <div className="p-3 bg-pink-400 text-white font-bold flex justify-between items-center rounded-t-xl">
                AI Chatbot
                <button onClick={() => setChatOpen(false)}>X</button>
              </div>
              <div className="p-3 h-64 overflow-y-auto flex flex-col gap-2">
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
                <div ref={messagesEndRef}></div>
              </div>
              <form onSubmit={sendMessage} className="flex p-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your question..."
                  className="flex-1 border rounded-l-md p-2"
                />
                <button className="bg-pink-400 text-white px-4 rounded-r-md" disabled={!input.trim()}>
                  Send
                </button>
              </form>
            </div>
          ) : (
            <button
              onClick={() => setChatOpen(true)}
              className="p-4 rounded-full bg-pink-500 text-white shadow-lg hover:scale-110 transition"
            >
              <FaRobot size={24} />
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
