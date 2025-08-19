import React from "react";
import { useNavigate } from "react-router-dom";

const NotificationsPage = () => {
  const navigate = useNavigate();

  const notifications = [
    "New lesson added to UI/UX Design Principles",
    "Your assignment for Data Analysis is due tomorrow",
    "Course Introduction to Web Development updated",
  ];

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Back Button */}
      <button
        onClick={() => navigate("/learner-dashboard")}
        className="mb-4 px-4 py-2 rounded bg-indigo-400 hover:bg-indigo-500 text-white shadow-sm transition"
      >
        Back
      </button>

      <h1 className="text-3xl font-bold mb-6">Notifications</h1>
      <ul className="space-y-3">
        {notifications.map((note, idx) => (
          <li
            key={idx}
            className="p-4 bg-white rounded shadow text-gray-700"
          >
            {note}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NotificationsPage;
