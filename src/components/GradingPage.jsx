// src/components/GradingPage.jsx
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

const dummySubmissions = [
  { id: "sub1", studentId: "studentA", assignmentId: "assignment1", content: "https://example.com/submission1.pdf", graded: false },
  { id: "sub2", studentId: "studentB", assignmentId: "assignment2", content: "https://example.com/submission2.pdf", graded: false },
  { id: "sub3", studentId: "studentC", assignmentId: "assignment1", content: "https://example.com/submission3.pdf", graded: false },
];

const dummyGraded = [
  { id: "gsub1", studentId: "studentX", assignmentId: "assignment1", grade: "A", feedback: "Great work!", date: "2025-09-20" },
  { id: "gsub2", studentId: "studentY", assignmentId: "test1", grade: "75%", feedback: "Good attempt, improve details.", date: "2025-09-18" },
];

export default function GradingPage({ darkMode }) {
  const [submissions, setSubmissions] = useState([]);
  const [gradedSubmissions, setGradedSubmissions] = useState(dummyGraded);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [grade, setGrade] = useState("");
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setSubmissions(dummySubmissions);
      setLoading(false);
    }, 700);
  }, []);

  const handleGrade = () => {
    if (!selectedSubmission || !grade.trim()) {
      toast.error("Please select a submission and enter a grade");
      return;
    }

    const newGraded = {
      id: `g${selectedSubmission.id}`,
      studentId: selectedSubmission.studentId,
      assignmentId: selectedSubmission.assignmentId,
      grade,
      feedback,
      date: new Date().toISOString().split("T")[0],
    };

    setGradedSubmissions([newGraded, ...gradedSubmissions]);
    setSubmissions(submissions.filter((s) => s.id !== selectedSubmission.id));

    toast.success(`Submission by ${selectedSubmission.studentId} graded as ${grade}`);

    setSelectedSubmission(null);
    setGrade("");
    setFeedback("");
  };

  return (
    <div className={`p-6 rounded-xl shadow ${darkMode ? "bg-gray-800" : "bg-white"}`}>
      {/* Grading Panel Heading */}
      <div className="w-full py-3 bg-gradient-to-r from-blue-400 to-pink-400 text-white font-semibold rounded-xl shadow text-center mb-6">
        Grading Panel
      </div>

      {loading ? (
        <p className={darkMode ? "text-gray-300" : "text-gray-700"}>Loading submissions...</p>
      ) : submissions.length === 0 ? (
        <p className={darkMode ? "text-gray-300" : "text-gray-700"}>No ungraded submissions.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Submissions List */}
          <div className="space-y-3">
            <h3 className={`font-semibold mb-2 ${darkMode ? "text-white" : "text-gray-900"}`}>Ungraded Submissions</h3>
            {submissions.map((sub) => (
              <div
                key={sub.id}
                onClick={() => setSelectedSubmission(sub)}
                className={`p-3 rounded-lg border cursor-pointer transition ${
                  selectedSubmission?.id === sub.id
                    ? "border-blue-400 bg-blue-50 dark:bg-gray-700"
                    : !darkMode
                    ? "border-gray-300 hover:bg-gray-50"
                    : "border-gray-600 hover:bg-gray-700"
                }`}
              >
                <p className={darkMode ? "text-white" : "text-gray-900"}>
                  <span className="font-semibold">Student:</span> {sub.studentId}
                </p>
                <p className={darkMode ? "text-gray-300" : "text-gray-600"}>
                  Assignment: {sub.assignmentId}
                </p>
              </div>
            ))}
          </div>

          {/* Grading Form */}
          {selectedSubmission && (
            <div className={`p-4 border rounded-lg ${darkMode ? "dark:border-gray-600 bg-gray-700" : "border-gray-300 bg-gray-50"}`}>
              <h3 className={`font-semibold mb-2 ${darkMode ? "text-white" : "text-gray-900"}`}>Grade Submission</h3>
              <p className={darkMode ? "text-gray-300" : "text-gray-700"}>
                <span className="font-semibold">Student:</span> {selectedSubmission.studentId}
              </p>
              <p className={darkMode ? "text-gray-300" : "text-gray-700"}>
                <span className="font-semibold">Assignment:</span> {selectedSubmission.assignmentId}
              </p>
              <a href={selectedSubmission.content} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-sm mb-2 block">
                View Submission
              </a>

              <input
                type="text"
                placeholder="Grade (e.g., A, 85%)"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className={`w-full p-2 mb-2 border rounded ${darkMode ? "dark:bg-gray-700 dark:text-white dark:border-gray-600" : "border-gray-300"}`}
              />
              <textarea
                placeholder="Feedback"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className={`w-full p-2 mb-2 border rounded ${darkMode ? "dark:bg-gray-700 dark:text-white dark:border-gray-600" : "border-gray-300"}`}
              />

              <button
                onClick={handleGrade}
                className="bg-gradient-to-r from-blue-400 to-pink-400 text-white px-4 py-2 rounded hover:from-blue-500 hover:to-pink-500"
              >
                Submit Grade
              </button>
            </div>
          )}
        </div>
      )}

      {/* Already graded section */}
      <div className="mt-12">
        <div className="w-full py-3 bg-gradient-to-r from-blue-400 to-pink-400 text-white font-semibold rounded-xl shadow text-center mb-4">
          Previously Graded Submissions
        </div>

        {gradedSubmissions.length === 0 ? (
          <p className={darkMode ? "text-gray-300" : "text-gray-700"}>No graded submissions.</p>
        ) : (
          <div className="space-y-4">
            {gradedSubmissions.map((entry) => (
              <div key={entry.id} className={`p-4 border rounded-lg ${darkMode ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-300"}`}>
                <p className={darkMode ? "text-white" : "text-gray-900"}>
                  <span className="font-semibold">Student:</span> {entry.studentId}
                </p>
                <p className={darkMode ? "text-gray-300" : "text-gray-700"}>
                  <span className="font-semibold">Assignment/Test:</span> {entry.assignmentId}
                </p>
                <p className={darkMode ? "text-gray-300" : "text-gray-700"}>
                  <span className="font-semibold">Grade:</span> {entry.grade}
                </p>
                <p className={darkMode ? "text-gray-300" : "text-gray-700"}>
                  <span className="font-semibold">Feedback:</span> {entry.feedback}
                </p>
                <p className="text-sm italic text-gray-500">Graded on: {entry.date}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
