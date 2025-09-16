import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
} from "firebase/firestore";

export default function FacilitatorsManagement() {
  const [facilitators, setFacilitators] = useState([]);
  const [newName, setNewName] = useState("");
  const [newExpertise, setNewExpertise] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch facilitators from Firestore
  useEffect(() => {
    const fetchFacilitators = async () => {
      try {
        const q = query(collection(db, "users"), where("role", "==", "facilitator"), orderBy("name"));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setFacilitators(data);
      } catch (err) {
        console.error("Error fetching facilitators:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFacilitators();
  }, []);

  // Add a new facilitator
  const handleAddFacilitator = async () => {
    if (!newName.trim() || !newExpertise.trim()) return;

    try {
      const docRef = await addDoc(collection(db, "users"), {
        name: newName.trim(),
        role: "facilitator",
        expertise: newExpertise.trim(),
      });

      setFacilitators((prev) => [
        ...prev,
        { id: docRef.id, name: newName.trim(), role: "facilitator", expertise: newExpertise.trim() },
      ]);

      setNewName("");
      setNewExpertise("");
    } catch (err) {
      console.error("Error adding facilitator:", err);
    }
  };

  // Remove facilitator
  const handleRemoveFacilitator = async (id) => {
    try {
      await deleteDoc(doc(db, "users", id));
      setFacilitators((prev) => prev.filter((f) => f.id !== id));
    } catch (err) {
      console.error("Error removing facilitator:", err);
    }
  };

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      <h3 className="text-2xl font-bold mb-6 text-gray-700">Manage Facilitators</h3>

      {/* Add new facilitator */}
      <div className="flex flex-col md:flex-row gap-2 mb-6">
        <input
          type="text"
          placeholder="Name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className="flex-1 px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="text"
          placeholder="Expertise"
          value={newExpertise}
          onChange={(e) => setNewExpertise(e.target.value)}
          className="flex-1 px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleAddFacilitator}
          className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
        >
          Add
        </button>
      </div>

      {/* Facilitators list */}
      {loading ? (
        <p className="text-gray-500">Loading facilitators...</p>
      ) : facilitators.length === 0 ? (
        <p className="text-gray-500">No facilitators found.</p>
      ) : (
        <ul className="grid md:grid-cols-2 gap-4">
          {facilitators.map((f) => (
            <li
              key={f.id}
              className="bg-white shadow rounded-xl p-4 flex justify-between items-center hover:shadow-lg transition"
            >
              <div>
                <h4 className="font-semibold text-gray-700">{f.name}</h4>
                <p className="text-sm text-gray-500 italic">{f.expertise}</p>
              </div>
              <button
                onClick={() => handleRemoveFacilitator(f.id)}
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
