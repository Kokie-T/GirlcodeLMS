import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "../firebase";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

export default function StudentContentPage() {
  const { id } = useParams(); // courseId
  const auth = getAuth();
  const user = auth.currentUser;

  const [course, setCourse] = useState(null);
  const [activeQuestions, setActiveQuestions] = useState([]);
  const [answers, setAnswers] = useState({}); // track student selections

  // Fetch course details
  useEffect(() => {
    const fetchCourse = async () => {
      const courseRef = doc(db, "courses", id);
      const snap = await getDoc(courseRef);
      if (snap.exists()) {
        setCourse({ id: snap.id, ...snap.data() });
      }
    };
    fetchCourse();
  }, [id]);

  // Listen for active questions
  useEffect(() => {
    const q = query(
      collection(db, "activeQuestions"),
      where("courseId", "==", id),
      where("isActive", "==", true)
    );
    const unsub = onSnapshot(q, (snapshot) => {
      const questions = [];
      snapshot.forEach((doc) => questions.push({ id: doc.id, ...doc.data() }));
      setActiveQuestions(questions);
    });
    return () => unsub();
  }, [id]);

  // Submit answer
  const submitAnswer = async (setId, qIdx, question, selectedOption) => {
    if (!user) return;

    try {
      await addDoc(collection(db, "submissions"), {
        userId: user.uid,
        courseId: id,
        questionSetId: setId,
        questionIndex: qIdx,
        question: question.question,
        selectedAnswer: selectedOption,
        correctAnswer: question.answer, // from AI/library
        createdAt: serverTimestamp(),
      });

      alert("Answer submitted!");
    } catch (error) {
      console.error("Error saving answer:", error);
      alert("Failed to submit answer.");
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
        {course?.title}
      </h1>

      <h2 className="text-xl font-semibold mt-8 mb-2">Active Questions</h2>
      {activeQuestions.length > 0 ? (
        activeQuestions.map((set) => (
          <div key={set.id} className="mb-6 p-4 border rounded-lg dark:border-gray-700">
            {set.questions.map((q, idx) => (
              <div key={idx} className="mb-5">
                <p className="font-semibold text-gray-800 dark:text-gray-200">
                  {idx + 1}. {q.question}
                </p>

                <ul className="mt-2 space-y-2">
                  {q.options.map((opt, i) => (
                    <li
                      key={i}
                      onClick={() => setAnswers((prev) => ({ ...prev, [idx]: opt }))}
                      className={`p-2 rounded cursor-pointer ${
                        answers[idx] === opt
                          ? "bg-blue-500 text-white"
                          : "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                      }`}
                    >
                      {opt}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() =>
                    submitAnswer(set.id, idx, q, answers[idx])
                  }
                  disabled={!answers[idx]}
                  className="mt-2 px-4 py-2 bg-green-500 text-white rounded disabled:opacity-50"
                >
                  Submit
                </button>
              </div>
            ))}
          </div>
        ))
      ) : (
        <p className="text-gray-500 dark:text-gray-400">No active questions right now.</p>
      )}
    </div>
  );
}
