import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, addDoc } from "firebase/firestore";
import { FaFilter } from "react-icons/fa";

export default function EnrollStudent() {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(true);
  const [filterCourse, setFilterCourse] = useState("");
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const studentsSnap = await getDocs(collection(db, "users"));
        const studentsData = studentsSnap.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .filter((u) => u.role === "student");
        setStudents(studentsData);

        const coursesSnap = await getDocs(collection(db, "courses"));
        const coursesData = coursesSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setCourses(coursesData);

        const enrollSnap = await getDocs(collection(db, "enrollments"));
        const enrollmentsData = enrollSnap.docs.map((doc) => doc.data());
        setEnrollments(enrollmentsData);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setTableLoading(false);
      }
    }
    fetchData();
  }, []);

  const availableCourses = selectedStudent
    ? courses.filter(
        (course) =>
          !enrollments.some(
            (e) => e.studentId === selectedStudent && e.courseId === course.id
          )
      )
    : courses;

  const handleEnroll = async () => {
    if (!selectedStudent || !selectedCourse) {
      alert("Please select both student and course!");
      return;
    }
    if (!window.confirm("Are you sure you want to enroll this student?")) return;

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
      const enrollSnap = await getDocs(collection(db, "enrollments"));
      setEnrollments(enrollSnap.docs.map((doc) => doc.data()));
    } catch (error) {
      console.error("Enrollment failed:", error);
      alert("❌ Failed to enroll student.");
    }
    setLoading(false);
  };

  const filteredStudents = filterCourse
    ? students.filter((student) =>
        enrollments.some((e) => e.studentId === student.id && e.courseId === filterCourse)
      )
    : students;

  return (
    <div className="p-6 min-h-screen">
      {/* Heading */}
      <div className="w-full py-3 bg-gradient-to-r from-blue-400 to-pink-400 text-white font-semibold rounded-xl shadow hover:opacity-90 transition mb-6">
        <h1 className="text-3xl text-center">Enroll Student</h1>
      </div>

      {/* Enrollment Form */}
      <div className="space-y-6 max-w-md bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-10">
        <select
          value={selectedStudent}
          onChange={(e) => setSelectedStudent(e.target.value)}
          className="w-full p-3 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select Student</option>
          {students.map((s) => (
            <option key={s.id} value={s.id}>
              {s.firstName} {s.lastName} ({s.email})
            </option>
          ))}
        </select>

        <select
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value)}
          className="w-full p-3 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select Course</option>
          {availableCourses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>

        <button
          onClick={handleEnroll}
          disabled={loading}
          className={`w-full py-3 rounded-xl text-white bg-gradient-to-r from-blue-400 to-pink-400 font-semibold shadow hover:opacity-90 transition ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {loading ? "Enrolling..." : "Enroll Student"}
        </button>
      </div>

      {/* Enrollment Table Header with Filter Icon */}
        <div className="w-full flex justify-end px-4 py-3">
          <button
            onClick={() => setFilterDropdownOpen((open) => !open)}
            aria-label="Filter Enrollment Table"
            className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white focus:outline-none"
          >
            <FaFilter />
            Filter
          </button>

          {filterDropdownOpen && (
            <div className="absolute right-4 mt-10 w-48 bg-white dark:bg-gray-700 rounded-md shadow-lg z-50">
              <select
                value={filterCourse}
                onChange={(e) => {
                  setFilterCourse(e.target.value);
                  setFilterDropdownOpen(false);
                }}
                className="w-full p-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none"
              >
                <option value="">-- All Courses --</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Enrollment Table */}
        {tableLoading ? (
          <p className="p-4 text-center text-gray-700 dark:text-gray-300">Loading enrollments...</p>
        ) : (
          <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-600 rounded-b-xl">
            <thead>
              <tr>
                <th className="border border-gray-300 bg-gray-300 dark:border-gray-600 px-4 py-2 text-left text-black font-bold rounded-tl-lg">
                  Student Name
                </th>
                <th className="border border-gray-300 bg-gray-300 dark:border-gray-600 px-4 py-2 text-left text-black font-bold">
                  Email
                </th>
                <th className="border border-gray-300 bg-gray-300 dark:border-gray-600 px-4 py-2 text-left text-black font-bold rounded-tr-lg">
                  Enrolled Courses
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => {
                const enrolledCourseIds = enrollments
                  .filter((e) => e.studentId === student.id)
                  .map((e) => e.courseId);

                const enrolledCourses = courses
                  .filter((c) => enrolledCourseIds.includes(c.id))
                  .map((c) => c.title)
                  .join(", ") || "None";

                const studentName = `${student.firstName || ""} ${student.lastName || ""}`.trim();

                return (
                  <tr
                    key={student.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{studentName}</td>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{student.email}</td>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{enrolledCourses}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
    </div>
  );
}
