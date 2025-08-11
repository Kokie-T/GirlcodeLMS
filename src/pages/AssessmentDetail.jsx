import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";

const assessmentsData = {
  1: {
    title: "HTML Basics Quiz",
    timeLimit: 120, // seconds
    questions: [
      // ...
    ],
  },
  2: {
    title: "Python Data Analysis Test",
    timeLimit: 180,
    questions: [
      // ...
    ],
  },
  3: {
    title: "UI/UX Design Open Questions",
    timeLimit: 300,
    questions: [
      // ...
    ],
  },
};

export default function AssessmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const assessment = assessmentsData[id];
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(assessment?.timeLimit || 0);

  const timerRef = useRef();

  useEffect(() => {
    if (!assessment) return;

    setTimeLeft(assessment.timeLimit);

    timerRef.current = setInterval(() => {
      setTimeLeft((time) => {
        if (time <= 1) {
          clearInterval(timerRef.current);
          setSubmitted(true);
          return 0;
        }
        return time - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [assessment]);

  if (!assessment) return <div className="p-6">Assessment not found.</div>;

  const handleChange = (questionId, value) => {
    setAnswers({ ...answers, [questionId]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    clearInterval(timerRef.current);
    setSubmitted(true);
  };

  // Calculate MCQ score
  const score = Object.entries(answers).reduce((acc, [qId, ans]) => {
    const question = assessment.questions.find((q) => q.id === +qId);
    if (!question) return acc;
    if (question.type === "mcq" && question.answer === +ans) return acc + 1;
    return acc;
  }, 0);

  // Format time mm:ss
  const formatTime = (sec) => {
    const m = Math.floor(sec / 60)
      .toString()
      .padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div className="p-6 min-h-screen bg-gray-50 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">{assessment.title}</h1>

      {!submitted ? (
        <>
          <div className="mb-4 text-right font-mono text-lg text-red-600">
            Time Left: {formatTime(timeLeft)}
          </div>

          <form onSubmit={handleSubmit}>
            {assessment.questions.map((q) => (
              <div key={q.id} className="mb-6">
                <p className="font-semibold mb-2">{q.question}</p>

                {q.type === "mcq" && (
                  <div className="flex flex-col gap-2">
                    {q.options.map((opt, idx) => (
                      <label
                        key={idx}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="radio"
                          name={`q${q.id}`}
                          value={idx}
                          checked={answers[q.id] === idx}
                          onChange={() => handleChange(q.id, idx)}
                          required
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                )}

                {q.type === "text" && (
                  <textarea
                    name={`q${q.id}`}
                    className="w-full border rounded p-2"
                    value={answers[q.id] || ""}
                    onChange={(e) => handleChange(q.id, e.target.value)}
                    required
                  />
                )}
              </div>
            ))}

            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              Submit
            </button>
          </form>
        </>
      ) : (
        <div>
          <h2 className="text-xl font-semibold mb-4">Results</h2>

          <p>
            Your score on multiple-choice questions: {score} /{" "}
            {assessment.questions.filter((q) => q.type === "mcq").length}
          </p>

          <p className="mt-4 text-gray-700">
            Text responses have been submitted for review.
          </p>

          <button
            onClick={() => navigate("/assessments")}
            className="mt-6 px-5 py-2 bg-gray-300 rounded hover:bg-gray-400 transition"
          >
            Back to Assessments
          </button>
        </div>
      )}
    </div>
  );
}


