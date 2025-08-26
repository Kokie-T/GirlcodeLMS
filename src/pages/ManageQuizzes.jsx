import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";

export default function ManageQuizzes() {
  const [quizzes, setQuizzes] = useState([]);
  const [newQuizTitle, setNewQuizTitle] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Real-time subscription to quizzes
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "quizzes"),
      (snapshot) => {
        setQuizzes(
          snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
        );
      },
      (err) => {
        console.error("Error fetching quizzes:", err);
        setError("Failed to load quizzes.");
      }
    );
    return () => unsubscribe();
  }, []);

  // Add a manual quiz
  const handleAddQuiz = async () => {
    if (!newQuizTitle.trim()) return;
    setLoading(true);
    setError(null);
    try {
      await addDoc(collection(db, "quizzes"), {
        title: newQuizTitle,
        courseId: "manual",
        questions: [],
        createdAt: serverTimestamp(),
      });
      setNewQuizTitle("");
    } catch (err) {
      console.error("Error adding quiz:", err);
      setError("Failed to add quiz.");
    }
    setLoading(false);
  };

  // Auto-generate quiz from Vercel API
  const handleAutoGenerateQuiz = async () => {
    if (!selectedCourse) {
      setError("Please select a course first.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // 👇 Use your deployed Vercel endpoint
      const res = await fetch("https://your-app.vercel.app/api/generateQuiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ course: selectedCourse }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to generate quiz");

      // Save generated quiz to Firestore
      await addDoc(collection(db, "quizzes"), {
        title: `Auto Quiz - ${selectedCourse}`,
        courseId: selectedCourse,
        questions: data.questions, // <-- directly save questions
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      console.error("Error auto-generating quiz:", err);
      setError("Failed to auto-generate quiz.");
    }
    setLoading(false);
  };

  // Delete quiz
  const handleDeleteQuiz = async (id) => {
    setDeletingId(id);
    try {
      await deleteDoc(doc(db, "quizzes", id));
    } catch (err) {
      console.error("Error deleting quiz:", err);
      setError("Failed to delete quiz.");
    }
    setDeletingId(null);
  };

  return (
    <div className="p-6 bg-gradient-to-br from-purple-500 to-indigo-600 min-h-screen text-white">
      <h1 className="text-3xl font-bold mb-6">Manage Quizzes</h1>

      {/* Error Message */}
      {error && (
        <div className="mb-4 bg-red-500/80 p-3 rounded text-sm">{error}</div>
      )}

      {/* Manual Add Quiz */}
      <div className="mb-6 flex space-x-2">
        <input
          type="text"
          placeholder="New quiz title"
          value={newQuizTitle}
          onChange={(e) => setNewQuizTitle(e.target.value)}
          className="p-2 rounded text-black flex-1 focus:outline-none focus:ring-2 focus:ring-purple-300"
          disabled={loading}
        />
        <button
          onClick={handleAddQuiz}
          className="bg-green-500 px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50 transition"
          disabled={loading}
        >
          {loading ? "Adding..." : "Add"}
        </button>
      </div>

      {/* Auto-Generate Quiz */}
      <div className="mb-6 flex space-x-2">
        <input
          type="text"
          placeholder="Course name"
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value)}
          className="p-2 rounded text-black flex-1 focus:outline-none focus:ring-2 focus:ring-yellow-300"
          disabled={loading}
        />
        <button
          onClick={handleAutoGenerateQuiz}
          className="bg-yellow-500 px-4 py-2 rounded hover:bg-yellow-600 disabled:opacity-50 transition"
          disabled={loading}
        >
          {loading ? "Generating..." : "Auto-Generate"}
        </button>
      </div>

      {/* Quiz List */}
      {quizzes.length === 0 ? (
        <p className="text-gray-200">No quizzes yet. Add one above!</p>
      ) : (
        <ul className="space-y-3">
          {quizzes.map((quiz) => (
            <li
              key={quiz.id}
              className="flex justify-between items-center bg-white text-black p-4 rounded shadow hover:shadow-lg transition"
            >
              <span>{quiz.title}</span>
              <button
                onClick={() => handleDeleteQuiz(quiz.id)}
                className={`px-3 py-1 rounded transition ${
                  deletingId === quiz.id
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-red-500 hover:bg-red-600 text-white"
                }`}
                disabled={deletingId === quiz.id}
              >
                {deletingId === quiz.id ? "Deleting..." : "Delete"}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
