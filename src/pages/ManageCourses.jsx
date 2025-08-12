import React, { useEffect, useState } from "react";
import { db } from "../firebase"; // your firebase.js config
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";

export default function ManageCourses() {
  const [courses, setCourses] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [editId, setEditId] = useState(null);

  const coursesRef = collection(db, "courses");

  // Fetch courses from Firestore
  const fetchCourses = async () => {
    const snapshot = await getDocs(coursesRef);
    const courseList = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setCourses(courseList);
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  // Add or update course
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editId) {
      // Update existing
      const courseDoc = doc(db, "courses", editId);
      await updateDoc(courseDoc, { title, description });
      setEditId(null);
    } else {
      // Add new
      await addDoc(coursesRef, { title, description });
    }
    setTitle("");
    setDescription("");
    fetchCourses();
  };

  // Delete course
  const handleDelete = async (id) => {
    await deleteDoc(doc(db, "courses", id));
    fetchCourses();
  };

  // Start editing
  const handleEdit = (course) => {
    setTitle(course.title);
    setDescription(course.description);
    setEditId(course.id);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Manage Courses
        </h1>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 mb-8">
          <input
            type="text"
            placeholder="Course Title"
            className="w-full p-3 border rounded-md"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <textarea
            placeholder="Course Description"
            className="w-full p-3 border rounded-md"
            rows="3"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-blue-200 to-pink-200 font-semibold rounded-lg hover:scale-105 transition"
          >
            {editId ? "Update Course" : "Add Course"}
          </button>
        </form>

        {/* List of Courses */}
        <div className="space-y-4">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-gradient-to-r from-blue-50 to-pink-50 p-4 rounded-lg flex justify-between items-center"
            >
              <div>
                <h2 className="font-semibold">{course.title}</h2>
                <p className="text-sm text-gray-600">{course.description}</p>
              </div>
              <div className="space-x-2">
                <button
                  className="px-3 py-1 bg-yellow-200 rounded"
                  onClick={() => handleEdit(course)}
                >
                  Edit
                </button>
                <button
                  className="px-3 py-1 bg-red-300 rounded"
                  onClick={() => handleDelete(course.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
          {courses.length === 0 && (
            <p className="text-gray-500 text-center">No courses found.</p>
          )}
        </div>
      </div>
    </div>
  );
}
