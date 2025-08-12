import React, { useState } from "react";
import { FaQuestionCircle } from "react-icons/fa";
import { db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function Help() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

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
      setSuccess("Your message has been sent! We'll get back to you soon.");
    } catch (error) {
      console.error("Error sending message:", error);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-8">
        {/* Header */}
        <div className="flex items-center mb-6">
          <FaQuestionCircle size={32} className="text-pink-400 mr-3" />
          <h1 className="text-3xl font-bold text-gray-800">Help & Support</h1>
        </div>

        {/* Intro */}
        <p className="text-gray-600 mb-8">
          Need assistance? Here you can find answers to common questions and get in touch with our support team.
        </p>

        {/* FAQ Section */}
        <div className="space-y-4 mb-10">
          <div className="bg-gradient-to-r from-blue-50 to-pink-50 p-4 rounded-lg">
            <h2 className="font-semibold text-gray-800">How do I reset my password?</h2>
            <p className="text-gray-600 text-sm">
              Go to the profile page, enter your new password in the password field, and click "Update Profile".
            </p>
          </div>
          <div className="bg-gradient-to-r from-blue-50 to-pink-50 p-4 rounded-lg">
            <h2 className="font-semibold text-gray-800">Where can I view my courses?</h2>
            <p className="text-gray-600 text-sm">
              From the sidebar, click on "My Courses" to see all the courses you are enrolled in.
            </p>
          </div>
          <div className="bg-gradient-to-r from-blue-50 to-pink-50 p-4 rounded-lg">
            <h2 className="font-semibold text-gray-800">How do I contact support?</h2>
            <p className="text-gray-600 text-sm">
              Fill out the contact form below and our support team will get back to you within 24 hours.
            </p>
          </div>
        </div>

        {/* Contact Form */}
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block mb-2 font-medium text-gray-700">Your Name</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              type="text"
              placeholder="Enter your name"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-200"
              required
            />
          </div>
          <div>
            <label className="block mb-2 font-medium text-gray-700">Your Email</label>
            <input
              name="email"
              value={form.email}
              onChange={handleChange}
              type="email"
              placeholder="Enter your email"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-200"
              required
            />
          </div>
          <div>
            <label className="block mb-2 font-medium text-gray-700">Message</label>
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              placeholder="Type your message here..."
              rows="5"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-200"
              required
            ></textarea>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-blue-200 to-pink-200 text-gray-800 font-semibold rounded-xl shadow hover:scale-105 transition"
          >
            {loading ? "Sending..." : "Send Message"}
          </button>
        </form>

        {success && <p className="mt-4 text-green-600">{success}</p>}
      </div>
    </div>
  );
}
