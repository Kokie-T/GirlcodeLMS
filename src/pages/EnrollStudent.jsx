import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";

export default function EnrollStudent() {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch students
  useEffect(() => {
    const fetchStudents = async () => {
      const snapshot = await getDocs(collection(db, "students"));
      setStudents(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };
    fetchStudents();
  }, []);

  // Fetch courses
  useEffect(() => {
    const fetchCourses = async () => {
      const snapshot = await getDocs(collection(db, "courses"));
      setCourses(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };
    fetchCourses();
  }, []);

  const handleEnroll = async () => {
    if (!selectedStudent || !selectedCourse) return alert("Select both!");
    setLoading(true);
    try {
      const courseRef = doc(db, "courses", selectedCourse);
      await updateDoc(courseRef, {
        assignedLearners: arrayUnion(selectedStudent),
      });
      alert("Student enrolled successfully!");
      setSelectedStudent("");
      setSelectedCourse("");
    } catch (error) {
      console.error("Enrollment error:", error);
      alert("Failed to enroll student.");
    }
    setLoading(false);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Enroll Student</h1>

      <div className="space-y-4 max-w-md">
        <select
          value={selectedStudent}
          onChange={(e) => setSelectedStudent(e.target.value)}
          className="w-full p-3 border rounded"
        >
          <option value="">Select Student</option>
          {students.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} ({s.email})
            </option>
          ))}
        </select>

        <select
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value)}
          className="w-full p-3 border rounded"
        >
          <option value="">Select Course</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>

        <button
          onClick={handleEnroll}
          disabled={loading}
          className="w-full py-3 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
        >
          {loading ? "Enrolling..." : "Enroll Student"}
        </button>
      </div>
    </div>
  );
}
