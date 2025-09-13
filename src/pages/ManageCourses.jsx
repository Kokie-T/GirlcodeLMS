import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
} from "firebase/firestore";

export default function ManageCourses() {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState("");

  const coursesRef = collection(db, "courses");

  // --- Real-time fetch ---
  useEffect(() => {
    const unsub = onSnapshot(coursesRef, (snapshot) => {
      const courseList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCourses(courseList);
      setFilteredCourses(courseList);
    });

    return () => unsub();
  }, []);

  // --- Search filter ---
  useEffect(() => {
    if (!search.trim()) {
      setFilteredCourses(courses);
    } else {
      const filtered = courses.filter((course) =>
        course.title.toLowerCase().includes(search.toLowerCase())
      );
      setFilteredCourses(filtered);
    }
  }, [search, courses]);

  // --- Add or update course ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    try {
      if (editId) {
        if (!window.confirm("Update this course?")) return;
        await updateDoc(doc(db, "courses", editId), { title, description });
        setEditId(null);
      } else {
        await addDoc(coursesRef, { title, description });
      }
      setTitle("");
      setDescription("");
      setSearch(""); // reset search
    } catch (err) {
      console.error("Error saving course:", err);
    }
  };

  // --- Delete course ---
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this course?")) return;
    try {
      await deleteDoc(doc(db, "courses", id));
    } catch (err) {
      console.error("Error deleting course:", err);
    }
  };

  // --- Start editing ---
  const handleEdit = (course) => {
    setTitle(course.title);
    setDescription(course.description);
    setEditId(course.id);
  };

  // --- Cancel editing ---
  const handleCancelEdit = () => {
    setEditId(null);
    setTitle("");
    setDescription("");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-6 md:p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Manage Courses</h1>

        {/* Search */}
        <input
          type="text"
          placeholder="Search courses..."
          className="w-full p-3 border rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-300"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 mb-8">
          <input
            type="text"
            placeholder="Course Title"
            className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <textarea
            placeholder="Course Description"
            className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
            rows="3"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 py-3 bg-gradient-to-r from-blue-200 to-pink-200 font-semibold rounded-lg hover:scale-105 transition"
            >
              {editId ? "Update Course" : "Add Course"}
            </button>
            {editId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-4 py-3 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        {/* Course List */}
        <div className="space-y-4">
          {filteredCourses.length === 0 && (
            <p className="text-gray-500 text-center">No courses found.</p>
          )}

          {filteredCourses.map((course) => (
            <div
              key={course.id}
              className="bg-gradient-to-r from-blue-50 to-pink-50 p-4 rounded-lg flex justify-between items-center hover:shadow-md transition"
            >
              {/* Text content */}
              <div className="flex-1 min-w-0 pr-4">
                <h2 className="font-semibold truncate">{course.title}</h2>
                <p className="text-sm text-gray-600 overflow-hidden text-ellipsis line-clamp-2">
                  {course.description}
                </p>
              </div>

              {/* Buttons */}
              <div className="flex-shrink-0 flex gap-2">
                <button
                  className="px-3 py-1 bg-yellow-200 rounded hover:bg-yellow-300 transition"
                  onClick={() => handleEdit(course)}
                >
                  Edit
                </button>
                <button
                  className="px-3 py-1 bg-red-300 rounded hover:bg-red-400 transition"
                  onClick={() => handleDelete(course.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
