import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore";

export default function CourseManagement() {
  const [courses, setCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [editingCategory, setEditingCategory] = useState("");

  const fetchCourses = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "courses"));
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCourses(data);
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const filteredCourses = courses.filter((course) =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      const docRef = await addDoc(collection(db, "courses"), {
        title: newTitle,
        category: newCategory || "General",
        updatedAt: serverTimestamp(),
      });
      setCourses([{ id: docRef.id, title: newTitle, category: newCategory || "General" }, ...courses]);
      setNewTitle("");
      setNewCategory("");
      alert("Course added!");
    } catch (err) {
      console.error(err);
      alert("Failed to add course.");
    }
  };

  const handleEdit = (course) => {
    setEditingId(course.id);
    setEditingTitle(course.title);
    setEditingCategory(course.category);
  };

  const saveEdit = async (id) => {
    try {
      const docRef = doc(db, "courses", id);
      await updateDoc(docRef, {
        title: editingTitle,
        category: editingCategory || "General",
        updatedAt: serverTimestamp(),
      });
      setCourses(
        courses.map((c) =>
          c.id === id ? { ...c, title: editingTitle, category: editingCategory || "General" } : c
        )
      );
      setEditingId(null);
    } catch (err) {
      console.error(err);
      alert("Failed to update course.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this course?")) return;
    try {
      await deleteDoc(doc(db, "courses", id));
      setCourses(courses.filter((c) => c.id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete course.");
    }
  };

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">Course Management</h3>

      {/* Add Course */}
      <form onSubmit={handleAdd} className="flex flex-col md:flex-row gap-2 mb-4">
        <input
          type="text"
          placeholder="Course Title"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          className="px-3 py-2 border rounded-md flex-1"
        />
        <input
          type="text"
          placeholder="Category"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          className="px-3 py-2 border rounded-md"
        />
        <button className="bg-blue-500 text-white px-4 py-2 rounded-md">Add</button>
      </form>

      {/* Search */}
      <input
        type="text"
        placeholder="Search by title..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="px-3 py-2 border rounded-md mb-4 w-full"
      />

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full border border-gray-200 bg-white shadow rounded-lg">
          <thead className="bg-indigo-100 text-gray-700">
            <tr>
              <th className="px-4 py-2 text-left">Title</th>
              <th className="px-4 py-2 text-left">Category</th>
              <th className="px-4 py-2 text-left">Last Updated</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCourses.length > 0 ? (
              filteredCourses.map((course) => (
                <tr key={course.id} className="border-t">
                  <td className="px-4 py-2">
                    {editingId === course.id ? (
                      <input
                        type="text"
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        className="px-2 py-1 border rounded-md"
                      />
                    ) : (
                      course.title
                    )}
                  </td>
                  <td className="px-4 py-2">
                    {editingId === course.id ? (
                      <input
                        type="text"
                        value={editingCategory}
                        onChange={(e) => setEditingCategory(e.target.value)}
                        className="px-2 py-1 border rounded-md"
                      />
                    ) : (
                      course.category || "General"
                    )}
                  </td>
                  <td className="px-4 py-2">
                    {course.updatedAt?.toDate
                      ? course.updatedAt.toDate().toLocaleString()
                      : "N/A"}
                  </td>
                  <td className="px-4 py-2 flex gap-2">
                    {editingId === course.id ? (
                      <>
                        <button
                          onClick={() => saveEdit(course.id)}
                          className="bg-green-500 text-white px-3 py-1 rounded-md"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="bg-gray-300 px-3 py-1 rounded-md"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleEdit(course)}
                          className="bg-yellow-200 px-3 py-1 rounded-md"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(course.id)}
                          className="bg-red-200 px-3 py-1 rounded-md"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center py-4 text-gray-500">
                  No courses available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden flex flex-col gap-4">
        {filteredCourses.length > 0 ? (
          filteredCourses.map((course) => (
            <div key={course.id} className="bg-white shadow rounded-lg p-4">
              {editingId === course.id ? (
                <>
                  <input
                    type="text"
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    className="px-2 py-1 border rounded-md mb-2 w-full"
                  />
                  <input
                    type="text"
                    value={editingCategory}
                    onChange={(e) => setEditingCategory(e.target.value)}
                    className="px-2 py-1 border rounded-md mb-2 w-full"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => saveEdit(course.id)}
                      className="bg-green-500 text-white px-3 py-1 rounded-md flex-1"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="bg-gray-300 px-3 py-1 rounded-md flex-1"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h4 className="font-semibold text-gray-700">{course.title}</h4>
                  <p className="text-gray-500 mb-2">{course.category || "General"}</p>
                  <p className="text-xs text-gray-400 mb-2">
                    Last Updated: {course.updatedAt?.toDate ? course.updatedAt.toDate().toLocaleString() : "N/A"}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(course)}
                      className="bg-yellow-200 px-3 py-1 rounded-md flex-1"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(course.id)}
                      className="bg-red-200 px-3 py-1 rounded-md flex-1"
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500">No courses available</p>
        )}
      </div>
    </div>
  );
}
