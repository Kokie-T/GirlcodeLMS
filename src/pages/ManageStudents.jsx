import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  addDoc,
  updateDoc,
} from "firebase/firestore";

export default function ManageStudents() {
  const [students, setStudents] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [editId, setEditId] = useState(null);

  const studentsRef = collection(db, "students");

  // Fetch students
  const fetchStudents = async () => {
    try {
      const snapshot = await getDocs(studentsRef);
      setStudents(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // Add or update student
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email) {
      alert("Please fill in both fields");
      return;
    }

    try {
      if (editId) {
        // Update existing student
        const studentDoc = doc(db, "students", editId);
        await updateDoc(studentDoc, { name, email });
        setEditId(null);
      } else {
        // Add new student
        await addDoc(studentsRef, { name, email });
      }
      setName("");
      setEmail("");
      fetchStudents();
    } catch (error) {
      console.error("Error saving student:", error);
    }
  };

  // Delete student
  const handleDeleteStudent = async (id) => {
    try {
      await deleteDoc(doc(db, "students", id));
      setStudents((prev) => prev.filter((s) => s.id !== id));
    } catch (error) {
      console.error("Error deleting student:", error);
    }
  };

  // Edit student
  const handleEditStudent = (student) => {
    setName(student.name);
    setEmail(student.email);
    setEditId(student.id);
  };

  return (
    <div className="p-6 bg-gradient-to-br from-purple-500 to-indigo-600 min-h-screen text-white">
      <h1 className="text-3xl font-bold mb-6">Manage Students</h1>

      {/* Add/Edit Student Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white text-black p-4 rounded shadow mb-6 space-y-3"
      >
        <input
          type="text"
          placeholder="Student Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 border rounded"
        />
        <input
          type="email"
          placeholder="Student Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border rounded"
        />
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
        >
          {editId ? "Update Student" : "Add Student"}
        </button>
        {editId && (
          <button
            type="button"
            onClick={() => {
              setEditId(null);
              setName("");
              setEmail("");
            }}
            className="w-full bg-gray-400 text-white py-2 rounded hover:bg-gray-500 mt-2"
          >
            Cancel Edit
          </button>
        )}
      </form>

      {/* List of Students */}
      <ul className="space-y-3">
        {students.map((student) => (
          <li
            key={student.id}
            className="flex justify-between items-center bg-white text-black p-4 rounded shadow"
          >
            <div>
              <p className="font-semibold">{student.name}</p>
              <p className="text-sm text-gray-600">{student.email}</p>
            </div>
            <div className="space-x-2">
              <button
                onClick={() => handleEditStudent(student)}
                className="bg-yellow-400 text-white px-3 py-1 rounded hover:bg-yellow-500"
              >
                Edit
              </button>
              <button
                onClick={() => handleDeleteStudent(student.id)}
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
              >
                Remove
              </button>
            </div>
          </li>
        ))}
        {students.length === 0 && (
          <p className="text-gray-200 text-center">No students found.</p>
        )}
      </ul>
    </div>
  );
}
