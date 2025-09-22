import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase";
import {
  collection,
  doc,
  getDoc,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  getDocs,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import LearnerSidebar from "../components/LearnerSidebar";
import { FaBars } from "react-icons/fa";

const QuizViewer = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState([]);

  const auth = getAuth();
  const user = auth.currentUser;

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activePage, setActivePage] = useState("Quiz");
  const [darkMode, setDarkMode] = useState(JSON.parse(localStorage.getItem("darkMode")) || false);

  // Fetch quiz
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const quizRef = doc(db, "quizzes", courseId);
        const quizSnap = await getDoc(quizRef);

        if (quizSnap.exists()) {
          setQuestions(quizSnap.data().questions || []);
        } else {
          setQuestions([]);
        }
      } catch (err) {
        console.error("Error fetching quiz:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [courseId]);

  // Fetch past attempts
  useEffect(() => {
    if (!user) return;

    const fetchAttempts = async () => {
      try {
        const attemptsRef = collection(db, "users", user.uid, "results");
        const q = query(attemptsRef, orderBy("takenAt", "desc"));
        const snap = await getDocs(q);
        const userAttempts = snap.docs
          .filter((d) => d.data().courseId === courseId)
          .map((d) => ({ id: d.id, ...d.data() }));
        setAttempts(userAttempts);
      } catch (err) {
        console.error("Error fetching attempts:", err);
      }
    };
    fetchAttempts();
  }, [user, courseId]);

  const handleSelect = (questionIndex, option) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [questionIndex]: option }));
  };

  const handleSubmit = async () => {
    let correct = 0;
    questions.forEach((q, idx) => {
      if (answers[idx] === q.correctAnswer) correct++;
    });

    const finalScore = Math.round((correct / questions.length) * 100);
    setScore(finalScore);
    setSubmitted(true);

    if (user) {
      try {
        const attemptsRef = collection(db, "users", user.uid, "results");
        await addDoc(attemptsRef, {
          userId: user.uid,
          courseId,
          score: finalScore,
          answers,
          takenAt: serverTimestamp(),
        });
      } catch (err) {
        console.error("Error saving result:", err);
      }
    }
  };

  if (loading) return <p className="p-6 text-gray-600">Loading quiz...</p>;
  if (!loading && questions.length === 0)
    return <p className="p-6 text-gray-600">No quiz available for this course.</p>;

  return (
    <div className={`flex h-screen ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}>
      <LearnerSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        activePage={activePage}
        setActivePage={setActivePage}
        darkMode={darkMode}
      />

      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <button
            className="md:hidden p-2 bg-blue-500 text-white rounded-lg"
            onClick={() => setSidebarOpen(true)}
          >
            <FaBars />
          </button>
          <h1 className="text-2xl font-bold dark:text-white">📝 Course Quiz</h1>
        </div>

        {submitted && (
          <div className="bg-green-100 p-6 rounded-lg shadow mb-6">
            <h3 className="text-xl font-semibold text-green-700">Quiz Completed!</h3>
            <p className="text-gray-700 mt-2">
              You scored <span className="font-bold">{score}%</span>
            </p>

            {attempts.length > 0 && (
              <div className="mt-4">
                <h4 className="font-semibold text-gray-800 mb-2">Past Attempts</h4>
                <ul className="space-y-1 text-gray-700 text-sm">
                  {attempts.map((a, idx) => (
                    <li
                      key={idx}
                      className="flex justify-between border-b border-gray-200 pb-1"
                    >
                      <span>Attempt {attempts.length - idx}</span>
                      <span>
                        {a.score}% -{" "}
                        {a.takenAt?.toDate
                          ? a.takenAt.toDate().toLocaleString([], { hour12: true })
                          : new Date().toLocaleString([], { hour12: true })}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          {questions.map((q, idx) => (
            <div key={idx} className="mb-6 p-4 bg-white rounded-lg shadow">
              <p className="font-medium text-gray-800 mb-2">
                {idx + 1}. {q.text}
              </p>
              <div className="space-y-2">
                {q.options.map((opt, i) => {
                  let bgColor = "bg-white border-gray-300";

                  if (submitted) {
                    if (opt === q.correctAnswer) bgColor = "bg-green-100 border-green-400";
                    else if (answers[idx] === opt && opt !== q.correctAnswer)
                      bgColor = "bg-red-100 border-red-400";
                  } else if (answers[idx] === opt) {
                    bgColor = "bg-blue-100 border-blue-400";
                  }

                  return (
                    <label
                      key={i}
                      className={`block p-2 border rounded-lg cursor-pointer ${bgColor} font-medium`}
                    >
                      <input
                        type="radio"
                        name={`question-${idx}`}
                        value={opt}
                        checked={answers[idx] === opt}
                        onChange={() => handleSelect(idx, opt)}
                        className="hidden"
                        disabled={submitted}
                      />
                      {opt}
                    </label>
                  );
                })}
              </div>
            </div>
          ))}

          {!submitted && (
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-400 to-pink-400 text-white py-3 rounded-lg hover:opacity-90 transition"
            >
              Submit Quiz
            </button>
          )}

          {submitted && (
            <button
              type="button"
              onClick={() => navigate("/courses")}
              className="mt-2 w-full bg-blue-500 text-white py-3 rounded-lg hover:opacity-90 transition"
            >
              Back to Courses
            </button>
          )}
        </form>
      </main>
    </div>
  );
};

export default QuizViewer;
