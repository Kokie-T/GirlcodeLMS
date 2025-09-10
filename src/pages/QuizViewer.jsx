import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const QuizViewer = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        // 🔹 Fetch quiz document
        const quizRef = doc(db, "quizzes", courseId);
        const quizSnap = await getDoc(quizRef);

        if (quizSnap.exists()) {
          const quizData = quizSnap.data();
          setQuestions(quizData.questions || []);
        } else {
          console.warn("No quiz found for this course.");
          setQuestions([]);
        }
      } catch (error) {
        console.error("Error loading quiz:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [courseId]);

  const handleSelect = (questionIndex, option) => {
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
        // 🔹 Save results under users/{uid}/results/{courseId}
        await setDoc(
          doc(db, "users", user.uid, "results", courseId),
          {
            userId: user.uid,
            courseId,
            score: finalScore,
            answers,
            takenAt: new Date(),
          },
          { merge: true }
        );
      } catch (error) {
        console.error("Error saving result:", error);
      }
    }
  };

  if (loading) return <p className="p-6 text-gray-600">Loading quiz...</p>;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Course Quiz</h2>

      {submitted ? (
        <div className="bg-green-100 p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold text-green-700">
            Quiz Completed!
          </h3>
          <p className="text-gray-700 mt-2">
            You scored <span className="font-bold">{score}%</span>
          </p>
          <button
            onClick={() => navigate("/courses")}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg"
          >
            Back to Courses
          </button>
        </div>
      ) : (
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
                {q.options.map((opt, i) => (
                  <label
                    key={i}
                    className={`block p-2 border rounded-lg cursor-pointer ${
                      answers[idx] === opt
                        ? "bg-blue-100 border-blue-400"
                        : "border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name={`question-${idx}`}
                      value={opt}
                      checked={answers[idx] === opt}
                      onChange={() => handleSelect(idx, opt)}
                      className="hidden"
                    />
                    {opt}
                  </label>
                ))}
              </div>
            </div>
          ))}

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-400 to-pink-400 text-white py-3 rounded-lg hover:opacity-90 transition"
          >
            Submit Quiz
          </button>
        </form>
      )}
    </div>
  );
};

export default QuizViewer;
