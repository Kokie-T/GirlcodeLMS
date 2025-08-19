import React, { useState } from "react";

export default function FacilitatorsManagement() {
  const [facilitators, setFacilitators] = useState([
    { id: 1, name: "Alice Johnson", expertise: "Math" },
    { id: 2, name: "Mark Lee", expertise: "Science" },
  ]);

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">Manage Facilitators</h3>
      <ul className="space-y-3">
        {facilitators.map((f) => (
          <li
            key={f.id}
            className="bg-white shadow p-4 rounded-lg flex justify-between items-center"
          >
            <span>
              {f.name} — <span className="italic">{f.expertise}</span>
            </span>
            <button className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600">
              Remove
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
