import React, { useState } from "react";

export default function SystemSettings() {
  const [notifications, setNotifications] = useState(true);

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">System Settings</h3>
      <div className="bg-white shadow rounded-lg p-4 flex items-center justify-between">
        <span>Enable Notifications</span>
        <input
          type="checkbox"
          checked={notifications}
          onChange={() => setNotifications(!notifications)}
          className="w-5 h-5"
        />
      </div>
    </div>
  );
}
