// src/pages/EnrollStudent.jsx
import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, addDoc } from "firebase/firestore";

export default function EnrollStudent() {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch students, courses, and enrollments
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Students
        const studentsSnap = await getDocs(collection(db, "users"));
        const studentsData = studentsSnap.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(u => u.role === "student"); // only students
        setStudents(studentsData);

        // Courses
        const coursesSnap = await getDocs(collection(db, "courses"));
        const coursesData = coursesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Enrollments
        const enrollSnap = await getDocs(collection(db, "enrollments"));
        const enrollmentsData = enrollSnap.docs.map(doc => doc.data());
        setEnrollments(enrollmentsData);

        // Compute enrolled count
        const coursesWithCount = coursesData.map(course => ({
          ...course,
          enrolledCount: enrollmentsData.filter(e => e.courseId === course.id).length,
        }));

        setCourses(coursesWithCount);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };

    fetchData();
  }, []);

  // Filter courses for selected student
  const availableCourses = selectedStudent
    ? courses.filter(
        course =>
          !enrollments.some(
            e => e.studentId === selectedStudent && e.courseId === course.id
          )
      )
    : courses;

  const handleEnroll = async () => {
    if (!selectedStudent || !selectedCourse) {
      return alert("Please select both student and course!");
    }

    const confirm = window.confirm("Are you sure you want to enroll this student?");
    if (!confirm) return;

    setLoading(true);
    try {
      await addDoc(collection(db, "enrollments"), {
        studentId: selectedStudent,
        courseId: selectedCourse,
        enrolledAt: new Date(),
      });

      alert("✅ Student enrolled successfully!");
      setSelectedStudent("");
      setSelectedCourse("");

      // Refresh enrollments
      const enrollSnap = await getDocs(collection(db, "enrollments"));
      const enrollmentsData = enrollSnap.docs.map(doc => doc.data());
      setEnrollments(enrollmentsData);

      // Update enrolled count
      setCourses(prev =>
        prev.map(course => ({
          ...course,
          enrolledCount: enrollmentsData.filter(e => e.courseId === course.id).length,
        }))
      );
    } catch (err) {
      console.error("Enrollment failed:", err);
      alert("❌ Failed to enroll student.");
    }
    setLoading(false);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Enroll Student</h1>

      <div className="space-y-4 max-w-md">
        <select
          value={selectedStudent}
          onChange={e => setSelectedStudent(e.target.value)}
          className="w-full p-3 border rounded"
        >
          <option value="">Select Student</option>
          {students.map(s => (
            <option key={s.id} value={s.id}>
              {s.name} ({s.email})
            </option>
          ))}
        </select>

        <select
          value={selectedCourse}
          onChange={e => setSelectedCourse(e.target.value)}
          className="w-full p-3 border rounded"
        >
          <option value="">Select Course</option>
          {availableCourses.map(c => (
            <option key={c.id} value={c.id}>
              {c.title} ({c.enrolledCount} enrolled)
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
