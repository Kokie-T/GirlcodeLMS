import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";

export default function ManageStudents() {
  const [students, setStudents] = useState([]);

  // Fetch students
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const snapshot = await getDocs(collection(db, "students"));
        setStudents(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Error fetching students:", error);
      }
    };
    fetchStudents();
  }, []);

  // Delete student
  const handleDeleteStudent = async (id) => {
    try {
      await deleteDoc(doc(db, "students", id));
      alert("Student deleted");
    } catch (error) {
      console.error("Error deleting student:", error);
    }
  };

  return (
    <div className="p-6 bg-gradient-to-br from-purple-500 to-indigo-600 min-h-screen text-white">
      <h1 className="text-3xl font-bold mb-6">Manage Students</h1>

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
            <button
              onClick={() => handleDeleteStudent(student.id)}
              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
