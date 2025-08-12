import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, getDocs, addDoc, deleteDoc, doc } from "firebase/firestore";

export default function ManageQuizzes() {
  const [quizzes, setQuizzes] = useState([]);
  const [newQuizTitle, setNewQuizTitle] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch quizzes from Firestore
  const fetchQuizzes = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, "quizzes"));
      setQuizzes(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error("Error fetching quizzes:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  // Add new quiz
  const handleAddQuiz = async () => {
    if (!newQuizTitle.trim()) return alert("Please enter a quiz title.");
    setLoading(true);
    try {
      await addDoc(collection(db, "quizzes"), { title: newQuizTitle.trim() });
      setNewQuizTitle("");
      await fetchQuizzes(); // refresh list
      alert("Quiz added successfully!");
    } catch (error) {
      console.error("Error adding quiz:", error);
    }
    setLoading(false);
  };

  // Delete quiz
  const handleDeleteQuiz = async (id) => {
    if (!window.confirm("Are you sure you want to delete this quiz?")) return;
    setLoading(true);
    try {
      await deleteDoc(doc(db, "quizzes", id));
      await fetchQuizzes(); // refresh list
      alert("Quiz deleted");
    } catch (error) {
      console.error("Error deleting quiz:", error);
    }
    setLoading(false);
  };

  return (
    <div className="p-6 bg-gradient-to-br from-purple-500 to-indigo-600 min-h-screen text-white">
      <h1 className="text-3xl font-bold mb-6">Manage Quizzes</h1>

      <div className="mb-6 flex space-x-2">
        <input
          type="text"
          placeholder="New quiz title"
          value={newQuizTitle}
          onChange={(e) => setNewQuizTitle(e.target.value)}
          className="p-2 rounded text-black flex-1"
          disabled={loading}
        />
        <button
          onClick={handleAddQuiz}
          className="bg-green-500 px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
          disabled={loading}
        >
          Add
        </button>
      </div>

      {loading && <p>Loading...</p>}

      <ul className="space-y-3">
        {quizzes.map((quiz) => (
          <li
            key={quiz.id}
            className="flex justify-between items-center bg-white text-black p-4 rounded shadow"
          >
            {quiz.title}
            <button
              onClick={() => handleDeleteQuiz(quiz.id)}
              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
              disabled={loading}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
